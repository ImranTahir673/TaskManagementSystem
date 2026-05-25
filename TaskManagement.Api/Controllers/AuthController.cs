using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Data;
using TaskManagement.Api.DTOs.Auth;
using TaskManagement.Api.Models;
using TaskManagement.Api.Services;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    AppDbContext dbContext,
    IPasswordHasher<User> passwordHasher,
    ITokenService tokenService) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var normalizedUsername = request.Username.Trim().ToLowerInvariant();
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var usernameExists = await dbContext.Users.AnyAsync(u => u.Username.ToLower() == normalizedUsername);
        if (usernameExists)
        {
            return Conflict(new { message = "Username is already taken." });
        }

        var emailExists = await dbContext.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail);
        if (emailExists)
        {
            return Conflict(new { message = "Email is already registered." });
        }

        // Determine Role based on Username
        string assignedRole = "Regular";
        if (normalizedUsername == "admin" || normalizedUsername == "imran")
        {
            assignedRole = "Admin";
        }

        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Username = request.Username.Trim(),
            Email = request.Email.Trim(),
            Role = assignedRole // <-- Dynamically assigns Admin if it's you!
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        var (token, expiresAtUtc) = tokenService.GenerateToken(user);
        return Ok(new AuthResponse
        {
            Token = token,
            ExpiresAtUtc = expiresAtUtc,
            UserId = user.Id,
            Username = user.Username,
            Role = user.Role
        });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var input = request.UsernameOrEmail.Trim().ToLowerInvariant();
        var user = await dbContext.Users.FirstOrDefaultAsync(u =>
            u.Username.ToLower() == input || u.Email.ToLower() == input);

        if (user is null)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var verifyResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verifyResult == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        // RUNTIME ELEVATION JUMP:
        // This ensures even if your account was saved as "Regular" earlier,
        // logging in now forces your generated JWT token to carry the "Admin" role!
        if (user.Username.ToLower() == "imran" || user.Username.ToLower() == "imran2" || user.Username.ToLower() == "admin")
        {
            user.Role = "Admin";
        }

        var (token, expiresAtUtc) = tokenService.GenerateToken(user);
        return Ok(new AuthResponse
        {
            Token = token,
            ExpiresAtUtc = expiresAtUtc,
            UserId = user.Id,
            Username = user.Username,
            Role = user.Role
        });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var username = User.Identity?.Name;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        return Ok(new
        {
            userId,
            username,
            role
        });
    }

    [HttpGet("admin-only")]
    [Authorize(Roles = "Admin")]
    public IActionResult AdminOnly()
    {
        return Ok(new { message = "You have Admin access." });
    }
}
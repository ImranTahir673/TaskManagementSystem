using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Services;

public class TokenService(IConfiguration configuration) : ITokenService
{
    public (string token, DateTime expiresAtUtc) GenerateToken(User user)
    {
        var jwtSection = configuration.GetSection("Jwt");
        var key = jwtSection["Key"] ?? throw new InvalidOperationException("JWT key is missing.");
        var issuer = jwtSection["Issuer"] ?? "TaskManagement.Api";
        var audience = jwtSection["Audience"] ?? "TaskManagement.Client";
        var expiryMinutes = int.TryParse(jwtSection["ExpiryMinutes"], out var parsedMinutes)
            ? parsedMinutes
            : 60;

        var expiresAtUtc = DateTime.UtcNow.AddMinutes(expiryMinutes);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAtUtc);
    }
}
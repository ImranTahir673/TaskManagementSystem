using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Data;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/users")]
public class UsersController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserListItem>>> GetUsers()
    {
        var users = await dbContext.Users
            .AsNoTracking()
            .OrderBy(u => u.Username)
            .Select(u => new UserListItem
            {
                Id = u.Id,
                Username = u.Username,
                Role = u.Role
            })
            .ToListAsync();

        return Ok(users);
    }

    public class UserListItem
    {
        public string Id { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Data;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/tasks")]
public class TasksController(AppDbContext dbContext, ILogger<TasksController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<TaskItem>> Create(CreateTaskRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "Missing user identifier claim." });
        }

        logger.LogInformation("Creating task for user {UserId}", userId);

        var isAdmin = User.IsInRole("Admin");
        var ownerUserId = userId;

        if (isAdmin)
        {
            if (string.IsNullOrWhiteSpace(request.AssignedUserId))
            {
                return BadRequest(new { message = "AssignedUserId is required for admin task creation." });
            }

            var assignedUserExists = await dbContext.Users.AnyAsync(u => u.Id == request.AssignedUserId);
            if (!assignedUserExists)
            {
                return NotFound(new { message = "Assigned user was not found." });
            }

            ownerUserId = request.AssignedUserId;
        }

        var taskItem = new TaskItem
        {
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            Priority = string.IsNullOrWhiteSpace(request.Priority) ? "Medium" : request.Priority.Trim(),
            DueDate = request.DueDate,
            Category = string.IsNullOrWhiteSpace(request.Category) ? "General" : request.Category.Trim(),
            IsCompleted = request.IsCompleted,
            CreatedAtUtc = DateTime.UtcNow,
            UserId = ownerUserId
        };

        try
        {
            dbContext.TaskItems.Add(taskItem);
            await dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to manage task operation");
            throw;
        }

        return CreatedAtAction(nameof(GetTasks), new { id = taskItem.Id }, taskItem);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        var isAdmin = User.IsInRole("Admin");
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!isAdmin && string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "Missing user identifier claim." });
        }

        var query = dbContext.TaskItems.AsNoTracking();
        if (!isAdmin)
        {
            query = query.Where(t => t.UserId == userId);
        }

        var tasks = await query
            .OrderByDescending(t => t.CreatedAtUtc)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskItem>> Update(int id, UpdateTaskRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var taskItem = await dbContext.TaskItems.FirstOrDefaultAsync(t => t.Id == id);
        if (taskItem is null)
        {
            return NotFound(new { message = "Task not found." });
        }

        var isAdmin = User.IsInRole("Admin");
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isOwner = !string.IsNullOrWhiteSpace(userId) && taskItem.UserId == userId;

        if (!isAdmin && !isOwner)
        {
            return Forbid();
        }

        taskItem.Title = request.Title.Trim();
        taskItem.Description = request.Description?.Trim();
        taskItem.Priority = string.IsNullOrWhiteSpace(request.Priority) ? taskItem.Priority : request.Priority.Trim();
        taskItem.DueDate = request.DueDate ?? taskItem.DueDate;
        taskItem.Category = string.IsNullOrWhiteSpace(request.Category) ? taskItem.Category : request.Category.Trim();
        taskItem.IsCompleted = request.IsCompleted;

        await dbContext.SaveChangesAsync();

        return Ok(taskItem);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var taskItem = await dbContext.TaskItems.FirstOrDefaultAsync(t => t.Id == id);
        if (taskItem is null)
        {
            return NotFound(new { message = "Task not found." });
        }

        var isAdmin = User.IsInRole("Admin");
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isOwner = !string.IsNullOrWhiteSpace(userId) && taskItem.UserId == userId;

        if (!isAdmin && !isOwner)
        {
            return Forbid();
        }

        dbContext.TaskItems.Remove(taskItem);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    public class CreateTaskRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 100 characters.")]
        public string Title { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? Description { get; set; }

        public string? Priority { get; set; }

        public DateTime? DueDate { get; set; }

        public string? Category { get; set; }

        public bool IsCompleted { get; set; }

        public string? AssignedUserId { get; set; }
    }

    public class UpdateTaskRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 100 characters.")]
        public string Title { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? Description { get; set; }

        public string? Priority { get; set; }

        public DateTime? DueDate { get; set; }

        public string? Category { get; set; }

        public bool IsCompleted { get; set; }
    }
}
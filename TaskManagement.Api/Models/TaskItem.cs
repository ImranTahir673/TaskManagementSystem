namespace TaskManagement.Api.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "Medium";
    public bool IsCompleted { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public string UserId { get; set; } = string.Empty;
    public User? User { get; set; }
}
namespace TaskManagement.Api.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "Medium";
    public DateTime? DueDate { get; set; }
    public string Category { get; set; } = "General";
    public bool IsCompleted { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public string UserId { get; set; } = string.Empty;
    public User? User { get; set; }
}
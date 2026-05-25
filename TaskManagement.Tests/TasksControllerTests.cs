using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TaskManagement.Api.Controllers;
using TaskManagement.Api.Data;
using TaskManagement.Api.Models;
using Xunit;

namespace TaskManagement.Tests;

public class TasksControllerTests
{
    [Fact]
    public async Task CreateTask_WithInvalidModelState_ReturnsBadRequest()
    {
        var controller = CreateController();
        controller.ModelState.AddModelError("Title", "Title is required.");

        var request = new TasksController.CreateTaskRequest
        {
            Title = string.Empty,
            Description = "Test description",
            IsCompleted = false
        };

        var result = await controller.Create(request);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.True(controller.ModelState.ErrorCount > 0);
        Assert.IsType<SerializableError>(badRequest.Value);
    }

    [Fact]
    public async Task DeleteTask_WhenUserIsNotAdmin_ReturnsForbidden()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var dbContext = new AppDbContext(options);
        dbContext.TaskItems.Add(new TaskItem
        {
            Id = 1,
            Title = "Protected task",
            Description = "Owned by another user",
            IsCompleted = false,
            UserId = "owner-user-id",
            Priority = "Medium"
        });
        await dbContext.SaveChangesAsync();

        var controller = new TasksController(dbContext, NullLogger<TasksController>.Instance)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(
                        new[] { new Claim(ClaimTypes.NameIdentifier, "different-user-id") },
                        authenticationType: "TestAuth"))
                }
            }
        };

        var result = await controller.Delete(1);

        Assert.IsType<ForbidResult>(result);
    }

    private static TasksController CreateController()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var dbContext = new AppDbContext(options);
        var controller = new TasksController(dbContext, NullLogger<TasksController>.Instance);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                    new[] { new Claim(ClaimTypes.NameIdentifier, "test-user-id") },
                    authenticationType: "TestAuth"))
            }
        };

        return controller;
    }
}
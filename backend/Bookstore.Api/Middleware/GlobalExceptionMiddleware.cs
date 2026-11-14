using System.Net;
using System.Text.Json;

namespace Bookstore.Api.Middleware;

public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";

        (int statusCode, string message) = ex switch
        {
            KeyNotFoundException        => ((int)HttpStatusCode.NotFound,            ex.Message),
            UnauthorizedAccessException => ((int)HttpStatusCode.Unauthorized,        ex.Message),
            InvalidOperationException   => ((int)HttpStatusCode.BadRequest,          ex.Message),
            ArgumentException           => ((int)HttpStatusCode.BadRequest,          ex.Message),
            _                           => ((int)HttpStatusCode.InternalServerError, "An unexpected error occurred.")
        };

        context.Response.StatusCode = statusCode;

        var response = new
        {
            status = statusCode,
            message,
            traceId = context.TraceIdentifier
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}


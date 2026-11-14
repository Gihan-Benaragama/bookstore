using System.ComponentModel.DataAnnotations;

namespace Bookstore.Api.DTOs.Authors;

public class CreateAuthorDto
{
    [Required, MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    public string? Bio { get; set; }
}


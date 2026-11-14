using System.ComponentModel.DataAnnotations;

namespace Bookstore.Api.DTOs.Categories;

public class CreateCategoryDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}


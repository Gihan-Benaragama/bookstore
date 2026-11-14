using System.ComponentModel.DataAnnotations;

namespace Bookstore.Api.DTOs.Books;

public class CreateBookDto
{
    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string ISBN { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required, Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0.")]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }

    public string? CoverImageUrl { get; set; }

    [Required]
    public DateTime PublishedDate { get; set; }

    [Required]
    public int AuthorId { get; set; }

    [Required]
    public int CategoryId { get; set; }
}


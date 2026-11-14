namespace Bookstore.Api.DTOs.Books;

public class BookDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ISBN { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime PublishedDate { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int AuthorId { get; set; }
    public int CategoryId { get; set; }
}


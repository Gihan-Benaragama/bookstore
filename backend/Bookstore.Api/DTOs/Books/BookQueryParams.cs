namespace Bookstore.Api.DTOs.Books;

public class BookQueryParams
{
    public string? Search { get; set; }          // search title, author, ISBN
    public int? CategoryId { get; set; }
    public int? AuthorId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string SortBy { get; set; } = "title"; // title | price | publishedDate
    public string SortOrder { get; set; } = "asc"; // asc | desc
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}


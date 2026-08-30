namespace CrmSystem.DTOs;

public record CreateNewDealRecordDto(
    string CustomersName,
    string CustomersPhoneNumber,
    string Location,
    string? Description,
    DateTime? NextCall
);

public record DealRecordResponseDto(
    int Id,
    string CustomersName,
    string CustomersPhoneNumber,
    string Location,
    string? Description,
    DateTime CreatedAt,
    DateTime? NextCall
);

public record AllDealsResponseDto(
    int Id,
    string CustomersName,
    string CustomersPhoneNumber,
    string Location
);
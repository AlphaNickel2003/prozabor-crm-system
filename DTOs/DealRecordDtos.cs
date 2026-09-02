namespace CrmSystem.DTOs;

public record CreateNewDealRecordDto(
    string CustomersName,
    string CustomersPhoneNumber,
    string Location,
    string Description,
    DateTime DateTask
);

public record DealRecordResponseDto(
    int Id,
    string CustomersName,
    string CustomersPhoneNumber,
    string Location,
    string Description,
    DateTime DateTask
);

public record AllDealsResponseDto(
    int Id,
    string CustomersName,
    string CustomersPhoneNumber,
    string Location,
    DateTime DateTask
);
using CrmSystem.DTOs;
using CrmSystem.Services;
using Microsoft.AspNetCore.Mvc;

namespace CrmSystem.ApiController;

[ApiController]
[Route("api/deals")]
public class DealsApiController : ControllerBase
{
    private readonly ICrmService _crmService;

    public DealsApiController(ICrmService crmService)
    {
        _crmService = crmService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var allDeals = await _crmService.GetAllDealsAsync(ct);

        var allDealsDto = allDeals
            .Select(d => new AllDealsResponseDto(
                d.Id,
                d.CustomersName,
                d.CustomersPhoneNumber,
                d.Location,
                d.DateTask))
            .OrderByDescending(d => d.Id);

        return Ok(allDealsDto);
    }

     [HttpPost]
    public async Task<IActionResult> CreateDeal([FromBody] CreateNewDealRecordDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var newDeal = await _crmService.CreateDealAsync(dto, ct);

        var response = new DealRecordResponseDto(
            newDeal.Id,
            newDeal.CustomersName,
            newDeal.CustomersPhoneNumber,
            newDeal.Location,
            newDeal.Description,
            newDeal.DateTask);

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDeal(int id, CancellationToken ct)
    {
        var deal = await _crmService.GetDealByIdAsync(id, ct);
        if (deal == null)
        {
            return NotFound(new { message = $"Запись не найдена или была удалена."});
        }

        var response = new DealRecordResponseDto(
            deal.Id,
            deal.CustomersName,
            deal.CustomersPhoneNumber,
            deal.Location,
            deal.Description,
            deal.DateTask);
        
        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDeal(int id, [FromBody] CreateNewDealRecordDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var deal = await _crmService.UpdateDealAsync(id, dto, ct);
        if (deal == null) return NotFound(new {message = "Запись не найдена"});
        
        var response = new DealRecordResponseDto(
                deal.Id,
                deal.CustomersName,
                deal.CustomersPhoneNumber,
                deal.Location,
                deal.Description,
                deal.DateTask);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDeal(int id, CancellationToken ct)
    {
        var deleted = await _crmService.DeleteDealAsync(id, ct);
        if (deleted == false) return NotFound(new {message = "Запись не найдена"});
        return NoContent();
    }
}
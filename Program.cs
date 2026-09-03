using CrmSystem.Models;
using Microsoft.AspNetCore.Localization;
using System.Globalization;
using CrmSystem.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using CrmSystem.Data;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

builder.Services.AddScoped<ICrmService, CrmSystem.Services.CrmService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseStaticFiles();

app.UseRouting();
app.MapControllers();
app.UseRequestLocalization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Открываем браузер ДО того, как приложение начнёт "слушать" запросы
Process.Start(new ProcessStartInfo($"http://localhost:{5000}") { UseShellExecute = true });

app.Run();
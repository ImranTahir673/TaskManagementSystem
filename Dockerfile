FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# ✅ Updated to your new folder and .csproj name
COPY TaskManagementSystem.API/TaskManagementSystem.API.csproj TaskManagementSystem.API/
RUN dotnet restore TaskManagementSystem.API/TaskManagementSystem.API.csproj

# ✅ Updated target directory contexts
COPY TaskManagementSystem.API/ TaskManagementSystem.API/
WORKDIR /src/TaskManagementSystem.API
RUN dotnet publish TaskManagementSystem.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish ./

# ✅ Updated execution assembly pointer
ENTRYPOINT ["dotnet", "TaskManagementSystem.API.dll"]
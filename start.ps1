Write-Host "Installing backend dependencies..."
Set-Location "d:\project2\backend"
npm install

Write-Host "Installing frontend dependencies..."
Set-Location "d:\project2\frontend"
npm install

Write-Host "Initializing database..."
try {
    & psql -U postgres -d postgres -c "CREATE DATABASE real_estate;"
    & psql -U postgres -d real_estate -f "d:\project2\backend\database\init.sql"
} catch {
    Write-Host "Could not initialize Postgres DB. (Make sure postgres is running and accessible)"
}

Write-Host "Starting API & React Servers in new windows..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd d:\project2\backend; npm run dev`""
Start-Process powershell -ArgumentList "-NoExit -Command `"cd d:\project2\frontend; npm run dev`""

Write-Host "Done! The backend runs on port 5000 and the frontend typically on 5173. Check the new windows."

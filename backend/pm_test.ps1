$BASE = "http://localhost:8000/api/v1"
$PASS = 0
$FAIL = 0
$ERRORS = [System.Collections.ArrayList]@()

function Test-API {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Token = "",
        [hashtable]$Body = $null,
        [int]$Expect = 200
    )
    $headers = @{ "Accept"="application/json"; "Content-Type"="application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    try {
        $p = @{ Uri=$Url; Method=$Method; Headers=$headers; UseBasicParsing=$true }
        if ($Body) { $p["Body"] = ($Body | ConvertTo-Json -Depth 5) }
        $r = Invoke-WebRequest @p -ErrorAction Stop
        $code = [int]$r.StatusCode
        if ($code -eq $Expect) {
            Write-Host "  [PASS] $Name (HTTP $code)" -ForegroundColor Green
            $script:PASS++
            return ($r.Content | ConvertFrom-Json)
        } else {
            Write-Host "  [FAIL] $Name  got=$code  want=$Expect" -ForegroundColor Red
            $script:FAIL++
            [void]$script:ERRORS.Add("FAIL: $Name (got $code want $Expect)")
            return $null
        }
    } catch {
        $code = [int]$_.Exception.Response.StatusCode
        if ($code -eq $Expect) {
            Write-Host "  [PASS] $Name (HTTP $code)" -ForegroundColor Green
            $script:PASS++
            return $null
        }
        Write-Host "  [FAIL] $Name  HTTP=$code  $($_.Exception.Message)" -ForegroundColor Red
        $script:FAIL++
        [void]$script:ERRORS.Add("FAIL: $Name (HTTP $code)")
        return $null
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PM PANEL - HARD LEVEL API TESTING" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# --- GROUP 1: Authentication ---
Write-Host "--- GROUP 1: Authentication ---" -ForegroundColor Yellow
$pmR     = Test-API -Name "PM Login"     -Method POST -Url "$BASE/auth/login" -Body @{email="pm@prossignment.test";password="password"} -Expect 200
$writerR = Test-API -Name "Writer Login" -Method POST -Url "$BASE/auth/login" -Body @{email="writer1@test.com";password="password"} -Expect 200
$clientR = Test-API -Name "Client Login" -Method POST -Url "$BASE/auth/login" -Body @{email="client1@test.com";password="password"} -Expect 200
$adminR  = Test-API -Name "Admin Login"  -Method POST -Url "$BASE/auth/login" -Body @{email="admin@prossignment.test";password="password"} -Expect 200

$PM     = $pmR.token
$WRITER = $writerR.token
$CLIENT = $clientR.token
$ADMIN  = $adminR.token
if (!$PM) { Write-Host "FATAL: No PM token" -ForegroundColor Red; exit 1 }

# --- GROUP 2: Dashboard (Issue 1 and 2) ---
Write-Host ""
Write-Host "--- GROUP 2: Dashboard (Issue 1 and 2 Fix) ---" -ForegroundColor Yellow
$dash = Test-API -Name "PM can access Dashboard Stats (was 403)" -Method GET -Url "$BASE/dashboard/stats" -Token $PM -Expect 200
if ($dash.data) { Write-Host "     Data: total_assignments=$($dash.data.assignments_count)  writers=$($dash.data.writers_count)" -ForegroundColor DarkGray }
Test-API -Name "Client CANNOT access Dashboard (403 expected)" -Method GET -Url "$BASE/dashboard/stats" -Token $CLIENT -Expect 403 | Out-Null

# --- GROUP 3: Analytics (Issue 4) ---
Write-Host ""
Write-Host "--- GROUP 3: Analytics (Issue 4 Fix) ---" -ForegroundColor Yellow
Test-API -Name "PM can access Analytics (was 403)" -Method GET -Url "$BASE/analytics" -Token $PM -Expect 200 | Out-Null
Test-API -Name "Writer CANNOT access Analytics (403)" -Method GET -Url "$BASE/analytics" -Token $WRITER -Expect 403 | Out-Null

# --- GROUP 4: Assignments ---
Write-Host ""
Write-Host "--- GROUP 4: Assignments (PM Workflow) ---" -ForegroundColor Yellow
$aList = Test-API -Name "PM can list all Assignments" -Method GET -Url "$BASE/assignments" -Token $PM -Expect 200
$allA = $aList.data
Write-Host "     PM sees $($allA.Count) assignments" -ForegroundColor DarkGray

$pendingA  = $allA | Where-Object { $_.status -eq "pending_assignment" } | Select-Object -First 1
$assignedA = $allA | Where-Object { $_.status -eq "assigned" } | Select-Object -First 1
$submittedA = $allA | Where-Object { $_.status -eq "submitted" } | Select-Object -First 1

$usersR = Test-API -Name "PM can list Users" -Method GET -Url "$BASE/users" -Token $PM -Expect 200
$writerUser = $usersR.data | Where-Object { $_.roles -contains "writer" } | Select-Object -First 1
Write-Host "     Writer to assign: $($writerUser.name) id=$($writerUser.id)" -ForegroundColor DarkGray

if ($pendingA -and $writerUser) {
    Test-API -Name "PM can Assign Writer to Pending Assignment" -Method POST -Url "$BASE/assignments/$($pendingA.id)/assign" -Token $PM -Body @{writerId=$writerUser.id} -Expect 200 | Out-Null
}
if ($assignedA) {
    Test-API -Name "Invalid writer UUID rejected (Issue 6 Fix)" -Method POST -Url "$BASE/assignments/$($assignedA.id)/assign" -Token $PM -Body @{writerId="00000000-0000-0000-0000-000000000000"} -Expect 422 | Out-Null
}

# --- GROUP 5: Writer Accept and Submit ---
Write-Host ""
Write-Host "--- GROUP 5: Writer Accept and Submit ---" -ForegroundColor Yellow
$wList = Test-API -Name "Writer sees assigned work" -Method GET -Url "$BASE/assignments" -Token $WRITER -Expect 200
$wAssigned = $wList.data | Where-Object { $_.status -eq "assigned" } | Select-Object -First 1
if ($wAssigned) {
    Test-API -Name "Writer Accept Assignment" -Method POST -Url "$BASE/assignments/$($wAssigned.id)/accept" -Token $WRITER -Expect 200 | Out-Null
    Test-API -Name "Writer Submit Assignment" -Method POST -Url "$BASE/assignments/$($wAssigned.id)/submit" -Token $WRITER -Body @{note="Done!"} -Expect 200 | Out-Null
} else {
    Write-Host "  [SKIP] No assigned order found for writer" -ForegroundColor DarkYellow
}

# --- GROUP 6: PM Review and Deliver ---
Write-Host ""
Write-Host "--- GROUP 6: PM Review and Deliver ---" -ForegroundColor Yellow
$aList2 = Test-API -Name "PM refresh assignments" -Method GET -Url "$BASE/assignments" -Token $PM -Expect 200
$subFresh = $aList2.data | Where-Object { $_.status -eq "submitted" } | Select-Object -First 1
if ($subFresh) {
    Test-API -Name "PM Delivers submitted assignment" -Method POST -Url "$BASE/assignments/$($subFresh.id)/deliver" -Token $PM -Body @{note="Delivered!"} -Expect 200 | Out-Null
} else {
    Write-Host "  [SKIP] No submitted assignment to deliver" -ForegroundColor DarkYellow
}

# --- GROUP 7: Client Revision and PM Notification (Issue 5) ---
Write-Host ""
Write-Host "--- GROUP 7: Revision Notification (Issue 5 Fix) ---" -ForegroundColor Yellow
$cList = Test-API -Name "Client sees their assignments" -Method GET -Url "$BASE/assignments" -Token $CLIENT -Expect 200
$deliv = $cList.data | Where-Object { $_.status -eq "delivered" } | Select-Object -First 1
if ($deliv) {
    Test-API -Name "Client requests Revision" -Method POST -Url "$BASE/assignments/$($deliv.id)/request-revision" -Token $CLIENT -Body @{note="Add references"} -Expect 200 | Out-Null
    $pmNotifs = Test-API -Name "PM can read notifications" -Method GET -Url "$BASE/notifications" -Token $PM -Expect 200
    Write-Host "     PM has $($pmNotifs.data.Count) notifications" -ForegroundColor DarkGray
} else {
    Write-Host "  [SKIP] No delivered assignment for client" -ForegroundColor DarkYellow
}

# --- GROUP 8: Payment Reminder (Issue 3) ---
Write-Host ""
Write-Host "--- GROUP 8: Payment Reminder (Issue 3 Fix) ---" -ForegroundColor Yellow
$invR = Test-API -Name "PM can list Invoices" -Method GET -Url "$BASE/invoices" -Token $PM -Expect 200
$pendInv = $invR.data | Where-Object { $_.status -eq "pending" } | Select-Object -First 1
if ($pendInv) {
    Write-Host "     Invoice: $($pendInv.number) status=$($pendInv.status)" -ForegroundColor DarkGray
    Test-API -Name "PM can send Payment Reminder (new endpoint)" -Method POST -Url "$BASE/invoices/$($pendInv.id)/send-reminder" -Token $PM -Expect 200 | Out-Null
    Test-API -Name "Writer CANNOT send Reminder (403)" -Method POST -Url "$BASE/invoices/$($pendInv.id)/send-reminder" -Token $WRITER -Expect 403 | Out-Null
    Test-API -Name "Client CANNOT send Reminder (403)" -Method POST -Url "$BASE/invoices/$($pendInv.id)/send-reminder" -Token $CLIENT -Expect 403 | Out-Null
}

# --- GROUP 9: Settings (Admin only) ---
Write-Host ""
Write-Host "--- GROUP 9: Settings (Admin-only) ---" -ForegroundColor Yellow
Test-API -Name "PM CANNOT access Settings (403 expected)" -Method GET -Url "$BASE/settings" -Token $PM -Expect 403 | Out-Null
Test-API -Name "Admin CAN access Settings" -Method GET -Url "$BASE/settings" -Token $ADMIN -Expect 200 | Out-Null
Test-API -Name "Admin can Save Settings (PUT)" -Method PUT -Url "$BASE/settings" -Token $ADMIN -Body @{
    portal_name="Prossignment Portal"; company_name="Prossignment"; contact_email="admin@prossignment.test"
    contact_phone="+1234567890"; max_file_size=20; allowed_extensions="pdf,docx,zip"
} -Expect 200 | Out-Null

# --- GROUP 10: Add User (duplicate email bug) ---
Write-Host ""
Write-Host "--- GROUP 10: Add User Bug Check ---" -ForegroundColor Yellow
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
Test-API -Name "Admin creates new User" -Method POST -Url "$BASE/users" -Token $ADMIN -Body @{
    name="New Test Writer"; email="brand.new.$ts@test.com"; password="password123"; roles=@("writer"); is_active=$true
} -Expect 201 | Out-Null
Test-API -Name "Duplicate email returns 422 (not crash)" -Method POST -Url "$BASE/users" -Token $ADMIN -Body @{
    name="New Test Writer"; email="brand.new.$ts@test.com"; password="password123"; roles=@("writer")
} -Expect 422 | Out-Null

# --- GROUP 11: PM General Access ---
Write-Host ""
Write-Host "--- GROUP 11: PM General Access ---" -ForegroundColor Yellow
Test-API -Name "PM can view Profile" -Method GET -Url "$BASE/auth/me" -Token $PM -Expect 200 | Out-Null
Test-API -Name "PM can view Notifications" -Method GET -Url "$BASE/notifications" -Token $PM -Expect 200 | Out-Null
Test-API -Name "PM Unread Count" -Method GET -Url "$BASE/notifications/unread-count" -Token $PM -Expect 200 | Out-Null
Test-API -Name "PM can view Tasks" -Method GET -Url "$BASE/tasks" -Token $PM -Expect 200 | Out-Null
Test-API -Name "PM can view Calendar" -Method GET -Url "$BASE/calendar" -Token $PM -Expect 200 | Out-Null
Test-API -Name "PM can view Reports" -Method GET -Url "$BASE/reports?type=assignments" -Token $PM -Expect 200 | Out-Null
Test-API -Name "PM can view Finance Summary" -Method GET -Url "$BASE/finance/summary" -Token $PM -Expect 200 | Out-Null
Test-API -Name "PM can view Leads" -Method GET -Url "$BASE/leads" -Token $PM -Expect 200 | Out-Null

# --- RESULTS ---
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  FINAL RESULTS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PASSED : $PASS" -ForegroundColor Green
Write-Host "  FAILED : $FAIL" -ForegroundColor Red
Write-Host "  TOTAL  : $($PASS + $FAIL)" -ForegroundColor White
Write-Host ""
if ($ERRORS.Count -gt 0) {
    Write-Host "  Failed Tests:" -ForegroundColor Red
    foreach ($e in $ERRORS) { Write-Host "    - $e" -ForegroundColor Red }
    Write-Host ""
}
if (($PASS + $FAIL) -gt 0) {
    $rate = [math]::Round(($PASS / ($PASS + $FAIL)) * 100)
    if ($rate -ge 90) { Write-Host "  RESULT: $rate% --- EXCELLENT" -ForegroundColor Green }
    elseif ($rate -ge 70) { Write-Host "  RESULT: $rate% --- GOOD" -ForegroundColor Yellow }
    else { Write-Host "  RESULT: $rate% --- NEEDS FIX" -ForegroundColor Red }
}
Write-Host ""

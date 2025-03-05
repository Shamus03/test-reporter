![Tests failed](https://img.shields.io/badge/tests-3%20passed%2C%205%20failed%2C%202%20skipped-critical)
|Report|Passed|Failed|Skipped|Time|
|:---|---:|---:|---:|---:|
|fixtures/dotnet-nunit-legacy.xml|3 ✅|5 ❌|2 ⚪|0ms|
## ❌ <a id="user-content-r0" href="#r0">fixtures/dotnet-nunit-legacy.xml</a>
**10** tests were completed in **0ms** with **3** passed, **5** failed and **2** skipped.
|Test suite|Passed|Failed|Skipped|Time|
|:---|---:|---:|---:|---:|
|[C:\Users\james_t\source\repos\NUnitLegacy\NUnitLegacy.sln.C:\Users\james_t\source\repos\NUnitLegacy\NUnitLegacyTests\bin\Debug\NUnitLegacyTests.dll.NUnitLegacyTests](#r0s0)|3 ✅|5 ❌|2 ⚪|NaNms|
### ❌ <a id="user-content-r0s0" href="#r0s0">C:\Users\james_t\source\repos\NUnitLegacy\NUnitLegacy.sln.C:\Users\james_t\source\repos\NUnitLegacy\NUnitLegacyTests\bin\Debug\NUnitLegacyTests.dll.NUnitLegacyTests</a>
```
CalculatorTests
  ✅ NUnitLegacyTests.CalculatorTests.Is_Even_Number(2)
  ❌ NUnitLegacyTests.CalculatorTests.Is_Even_Number(3)
	  Expected: True
	  But was:  False
	
  ❌ NUnitLegacyTests.CalculatorTests.Exception_In_TargetTest
	System.DivideByZeroException : Attempted to divide by zero.
  ❌ NUnitLegacyTests.CalculatorTests.Exception_In_Test
	System.Exception : Test
  ❌ NUnitLegacyTests.CalculatorTests.Failing_Test
	  Expected: 3
	  But was:  2
	
  ⚪ NUnitLegacyTests.CalculatorTests.Inconclusive_Test
	couldn't run test for some reason
  ✅ NUnitLegacyTests.CalculatorTests.Passing_Test
  ✅ NUnitLegacyTests.CalculatorTests.Passing_Test_With_Description
  ⚪ NUnitLegacyTests.CalculatorTests.Skipped_Test
	Skipped
  ❌ NUnitLegacyTests.CalculatorTests.Timeout_Test
	Test exceeded Timeout value of 1ms
```
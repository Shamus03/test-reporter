export interface NunitReport {
  'test-results': TestResults
}

export interface TestResults {
  $: {
    time: string
  }
  'test-suite'?: TestSuite[]
}

export interface TestSuite {
  $: {
    type: string
    name: string
  }
  results: TestSuiteResult[]
}

export interface TestSuiteResult {
  'test-case'?: TestCase[]
  'test-suite'?: TestSuite[]
}

export interface TestCase {
  $: {
    name: string
    result: string
    time: string
  }
  failure?: TestFailure[]
  reason?: TestFailure[]
}

export interface TestFailure {
  message?: string[]
  'stack-trace'?: string[]
}

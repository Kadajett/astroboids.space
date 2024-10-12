import { VM } from 'vm2';

export function executeScript(scriptCode: string, context: any) {
  const vm = new VM({
    timeout: 1000,
    sandbox: context,
  });

  try {
    return vm.run(scriptCode);
  } catch (error) {
    console.error('Script execution error:', error);
    return null;
  }
}


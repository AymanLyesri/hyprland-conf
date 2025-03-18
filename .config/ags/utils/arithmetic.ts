
export function containsOperator(str: string): boolean
{
    // Regular expression to match essential arithmetic operators (without nth root and logarithm)
    const operatorPattern = /[+\-*/×÷%^]|(\*\*)/;

    // Test if the string contains any of the operators
    return operatorPattern.test(str);
}

export function arithmetic(text: string): string
{
    try {
        const result = new Function(`return (${text})`)();

        return (typeof result === 'number' && isFinite(result)) ? String(result) : '';
    } catch {
        return '';
    }
}



export function containsOperator(str: string): boolean
{
    // Regular expression to match essential arithmetic operators (without nth root and logarithm)
    const operatorPattern = /[+\-*/×÷%^]|(\*\*)/;

    // Test if the string contains any of the operators
    return operatorPattern.test(str);
}

export function arithmetic(text: string)
{
    try {
        // Evaluate the arithmetic expression
        const result = eval(text);

        // Check if the result is a finite number
        if (typeof result === 'number' && isFinite(result)) {
            return String(result);
        } else {
            // Return null if result is not a valid number
            return '';
        }
    } catch (error) {
        // If there's any error (like a malformed expression), return null
        return '';
    }
}

export function formatToURL(domain: string): string
{
    // Trim whitespace and ensure the domain is lowercase
    domain = domain.trim().toLowerCase();

    // Check if the domain already starts with a protocol
    if (!/^https?:\/\//.test(domain)) {
        // Prepend with https:// by default
        domain = `https://${domain}`;
    }

    return domain;
}


export function containsProtocolOrTLD(str: string): boolean
{
    // Regular expression to match http or https protocols
    const protocolPattern = /^(http|https):\/\//;

    // Regular expression to match common TLDs, including possible paths after the TLD
    const tldPattern = /\.(com|net|org|io|gov|edu|co|info|biz|me)(\/.*)?$/;

    // Test if the string contains either a protocol or a TLD
    return protocolPattern.test(str) || tldPattern.test(str);
}

export function getDomainFromURL(url: string): string
{
    // Use a regex to extract the domain and the path
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)(\/.*)?$/);
    if (match) {
        let domain = match[1];

        // Remove the extension by splitting at the dot and joining parts except the last one
        const parts = domain.split('.');
        if (parts.length > 1) {
            domain = parts.slice(0, -1).join('.');
        }

        // Capitalize the first character of the domain
        domain = domain.charAt(0).toUpperCase() + domain.slice(1);

        // Extract the path after the domain (if any)
        let path = match[2] || '';
        path = path.split('/')
            .filter(segment => segment) // Remove empty segments
            .map(segment => segment.toLowerCase()) // Ensure lowercase
            .join(' - '); // Join with " - "

        // Combine domain and path
        return path ? `${domain} - ${path}` : domain;
    } else {
        return '';
    }
}

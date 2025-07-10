import React from 'react';

export const ValueRenderer = ({ value }: { value: any }) => {
  if (typeof value === 'object' && value !== null) {
    // Check if it's an array of objects that look like variations
    if (Array.isArray(value) && value.length > 0) {
      const hasVariationStructure = value.some(
        item =>
          typeof item === 'object' &&
          item !== null &&
          ('value' in item || 'name' in item || '_id' in item),
      );

      if (hasVariationStructure) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {value.map((item, index) => {
              // Handle different possible structures
              const displayName =
                item.name || item.key || `Variation ${index + 1}`;
              const displayValue = item.value !== undefined ? item.value : item;

              const isBooleanValue = typeof displayValue === 'boolean';
              const isEnabledValue =
                displayValue === true ||
                displayValue === 'true' ||
                (typeof displayValue === 'string' &&
                  displayValue.toLowerCase().includes('enable'));

              const valueString = isEnabledValue ? 'Enabled' : 'Disabled';
              const valueColor = isEnabledValue ? '#e8f5e8' : '#ffeaea';
              const valueTextColor = isEnabledValue ? '#2e7d32' : '#c62828';
              return (
                <div
                  key={item._id || item.key || index}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{displayName}</span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: isBooleanValue ? valueColor : '#f0f0f0',
                      color: isBooleanValue ? valueTextColor : '#666',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    {isBooleanValue
                      ? valueString
                      : JSON.stringify(displayValue, null, 2)}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }
    }

    // Check if it's a simple object with key-value pairs
    if (!Array.isArray(value) && Object.keys(value).length > 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {Object.entries(value).map(([key, val]) => (
            <div
              key={key}
              style={{
                padding: '4px 8px',
                backgroundColor: '#f8f9fa',
                borderRadius: '3px',
                fontSize: '0.875rem',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontWeight: 500, color: '#555' }}>{key}:</span>
              <span>{String(val)}</span>
            </div>
          ))}
        </div>
      );
    }

    // Fallback to JSON for other object types
    return (
      <pre
        style={{
          margin: 0,
          fontSize: '0.875rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxWidth: '400px',
          overflow: 'auto',
        }}
      >
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return String(value);
};

import { useTheme } from '@material-ui/core/styles';
import { Chip } from '@material-ui/core';

export const ValueRenderer = ({ value }: { value: any }) => {
  const theme = useTheme();

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

              return (
                <div
                  key={item._id || item.key || index}
                  style={{
                    display: 'flex',
                    justifyContent: 'start',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      padding: '2px 8px',
                    }}
                  >
                    {displayName}
                  </span>
                  {isBooleanValue ? (
                    <Chip
                      label={valueString}
                      size="small"
                      color={isEnabledValue ? 'primary' : 'secondary'}
                      style={{
                        backgroundColor: isEnabledValue
                          ? theme.palette.success?.main || '#4caf50'
                          : theme.palette.error?.main || '#f44336',
                        color: 'white',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor:
                          theme.palette.type === 'dark' ? '#333' : '#f0f0f0',
                        color: theme.palette.type === 'dark' ? '#bbb' : '#666',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      {JSON.stringify(displayValue, null, 2)}
                    </span>
                  )}
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
                backgroundColor:
                  theme.palette.type === 'dark' ? '#424242' : '#f8f9fa',
                borderRadius: '3px',
                fontSize: '0.875rem',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontWeight: 500,
                  color: theme.palette.text.primary,
                }}
              >
                {key}:
              </span>
              <span style={{ color: theme.palette.text.primary }}>
                {String(val)}
              </span>
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
          color: theme.palette.text.primary,
        }}
      >
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return String(value);
};

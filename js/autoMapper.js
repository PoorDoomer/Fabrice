// DOM Elements
const sourceCode = document.getElementById('sourceCode');
const targetCode = document.getElementById('targetCode');
const parseClassesBtn = document.getElementById('parseClassesBtn');
const mappingConfig = document.getElementById('mappingConfig');
const mappingFields = document.getElementById('mappingFields');
const generateMappingBtn = document.getElementById('generateMappingBtn');

// Store parsed properties
let sourceProperties = [];
let targetProperties = [];

/**
 * Parse C# class properties from code
 */
function parseProperties(code) {
    const properties = [];
    const propertyRegex = /public\s+([^\s]+)\s+([^\s]+)\s*{\s*get;\s*set;\s*}/g;
    let match;

    while ((match = propertyRegex.exec(code)) !== null) {
        properties.push({
            type: match[1],
            name: match[2]
        });
    }

    return properties;
}

/**
 * Extract class name from code
 */
function extractClassName(code) {
    const classRegex = /public\s+class\s+(\w+)/;
    const match = code.match(classRegex);
    return match ? match[1] : '';
}

/**
 * Create mapping field row
 */
function createMappingField(sourceProperty, targetProperties) {
    const row = document.createElement('div');
    row.className = 'flex items-center space-x-4 p-2 bg-white rounded';

    // Source property
    const sourceSpan = document.createElement('span');
    sourceSpan.className = 'w-1/3';
    sourceSpan.textContent = `${sourceProperty.name} (${sourceProperty.type})`;

    // Arrow
    const arrow = document.createElement('span');
    arrow.className = 'text-gray-500';
    arrow.textContent = '→';

    // Target property select
    const targetSelect = document.createElement('select');
    targetSelect.className = 'w-1/3 border p-2 rounded';
    targetSelect.dataset.sourceProperty = sourceProperty.name;

    // Add "None" option
    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.text = '-- None --';
    targetSelect.appendChild(noneOption);

    // Add target properties
    targetProperties.forEach(prop => {
        const option = document.createElement('option');
        option.value = prop.name;
        option.text = `${prop.name} (${prop.type})`;
        // Auto-select if names match
        if (prop.name.toLowerCase() === sourceProperty.name.toLowerCase()) {
            option.selected = true;
        }
        targetSelect.appendChild(option);
    });

    row.appendChild(sourceSpan);
    row.appendChild(arrow);
    row.appendChild(targetSelect);

    return row;
}

/**
 * Generate AutoMapper profile code
 */
function generateMappingProfile(sourceName, targetName, mappings) {
    return `using AutoMapper;

public class ${sourceName}Profile : Profile
{
    public ${sourceName}Profile()
    {
        CreateMap<${sourceName}, ${targetName}>()
${mappings.map(m => `            .ForMember(dest => dest.${m.target}, opt => opt.MapFrom(src => src.${m.source}))`).join('\n')}
            .ReverseMap();
    }
}`;
}

// Event Listeners
parseClassesBtn.addEventListener('click', () => {
    // Parse source code
    sourceProperties = parseProperties(sourceCode.value);
    const sourceName = extractClassName(sourceCode.value);
    
    // Parse target code
    targetProperties = parseProperties(targetCode.value);
    const targetName = extractClassName(targetCode.value);

    if (!sourceName || !targetName) {
        alert('Please provide valid C# classes with class declarations.');
        return;
    }

    if (sourceProperties.length === 0 || targetProperties.length === 0) {
        alert('No properties found in one or both classes.');
        return;
    }

    // Clear existing mapping fields
    mappingFields.innerHTML = '';

    // Create mapping fields for each source property
    sourceProperties.forEach(prop => {
        const field = createMappingField(prop, targetProperties);
        mappingFields.appendChild(field);
    });

    // Show mapping configuration
    mappingConfig.classList.remove('hidden');
});

generateMappingBtn.addEventListener('click', () => {
    const sourceName = extractClassName(sourceCode.value);
    const targetName = extractClassName(targetCode.value);

    // Collect mappings
    const mappings = [];
    const selects = mappingFields.querySelectorAll('select');
    selects.forEach(select => {
        if (select.value) {
            mappings.push({
                source: select.dataset.sourceProperty,
                target: select.value
            });
        }
    });

    if (mappings.length === 0) {
        alert('Please configure at least one mapping.');
        return;
    }

    // Generate and display the mapping profile
    const mappingCode = generateMappingProfile(sourceName, targetName, mappings);
    codePreview.textContent = mappingCode;
}); 
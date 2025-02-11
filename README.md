# Fabrice - Modern .NET 8 CRUD Generator
![Fabrice](nge.jpg)

Fabrice is a powerful, intuitive web application that generates clean and maintainable CRUD operations for .NET 8 applications. Built with modern best practices in mind, it supports multiple architectural patterns and provides a seamless development experience.

## Features

### 1. Multiple Architecture Patterns
- **CQRS Pattern** (Command Query Responsibility Segregation)
- **Service/Repository Pattern**
- **Simple Controller Pattern**

### 2. Code Generation
- Clean, well-structured code generation
- Support for DTOs (Data Transfer Objects)
- Automatic endpoint generation
- Dependency injection setup
- Authorization and validation attributes
- AutoMapper configuration

### 3. User Interface
- Modern, responsive design
- Dark/Light theme support
- Real-time code preview
- Syntax highlighting
- Copy to clipboard functionality
- Configuration saving/loading

### 4. DTO Management
- Dynamic field addition/removal
- Support for common .NET types
- Direct DTO code parsing
- Field validation

### 5. AutoMapper Integration
- Visual property mapping
- Source/Target code comparison
- Automatic profile generation

## Getting Started

1. Open the application in your web browser
2. Select your desired architectural pattern
3. Choose the HTTP method (GET, POST, PUT, DELETE)
4. Enter your entity name
5. Define DTO fields or paste existing DTO code
6. Add any required dependencies
7. Configure options (authorization, validation)
8. Click "Generate Code" to create your CRUD implementation

## Code Structure

The generated code includes:
- DTOs with optional validation
- Controllers with proper routing
- Pattern-specific implementations (Commands/Queries, Services, etc.)
- Dependency injection setup
- Authorization attributes (optional)

## Supported Types

- `int`
- `string`
- `decimal`
- `DateTime`
- `bool`
- `Guid`

## Configuration Options

- Namespace customization
- Authorization requirements
- Validation attributes
- Dependencies injection
- HTTP method selection

## Local Storage

The application supports:
- Saving configurations for later use
- Loading previous configurations
- Persisting common settings

## Best Practices

The generated code follows:
- Clean Architecture principles
- SOLID principles
- .NET 8 best practices
- Modern C# features
- Proper exception handling
- Async/await patterns

## Technical Requirements

- Modern web browser
- No backend required (client-side only)
- No installation needed

## Contributing

Feel free to submit issues and enhancement requests!

## For Developers

### Adding New Patterns

To add a new architectural pattern to Fabrice, follow these steps:

1. Create a new generator file in the `js` directory (e.g., `customPattern.js`)
2. Add your pattern to the pattern selection dropdown in `index.html`:
```html
<select id="patternSelect">
    <option value="custom">Your Custom Pattern</option>
</select>
```
3. Implement the pattern generator class following this structure:
```javascript
class CustomPatternGenerator {
    generateCode(config) {
        const {
            entityName,      // The name of the entity (e.g., "Product")
            httpMethod,      // HTTP method (GET, POST, PUT, DELETE)
            dtoFields,       // Array of fields: [{ name: "Id", type: "int" }, ...]
            namespace,       // Namespace for the generated code
            useAuthorization, // Boolean for [Authorize] attribute
            useValidation,   // Boolean for validation attributes
            dependencies     // Array of dependencies: [{ type: "ILogger", name: "logger" }, ...]
        } = config;

        // Generate your code here
        return generatedCode;
    }
}
```

### Available Configuration Options

When generating code, you have access to these configuration parameters:

1. **Entity Configuration**
   - `entityName`: String (e.g., "Product", "Customer")
   - `namespace`: String (e.g., "MyApp.Core")
   - `dtoFields`: Array of objects
     ```javascript
     [
       { name: "Id", type: "int" },
       { name: "Name", type: "string" },
       // ...
     ]
     ```

2. **HTTP Configuration**
   - `httpMethod`: String ("GET", "POST", "PUT", "DELETE")
   - `useAuthorization`: Boolean
   - `useValidation`: Boolean

3. **Dependencies**
   - Array of objects:
     ```javascript
     [
       { type: "ILogger<ProductController>", name: "logger" },
       { type: "IConfiguration", name: "config" }
     ]
     ```

### Template System

Templates can be defined using string literals with placeholders:
```javascript
const template = `
    public class {entityName}Controller : ControllerBase
    {
        {dependencies}
        
        [Http{httpMethod}]
        public async Task<ActionResult<{entityName}Dto>> {methodName}()
        {
            {methodBody}
        }
    }
`;
```

### Adding New Types

To add new .NET types for DTO fields:

1. Update the types array in `main.js`:
```javascript
const types = [
    'int',
    'string',
    'decimal',
    'DateTime',
    'bool',
    'Guid',
    'YourNewType'  // Add your type here
];
```

2. Ensure proper type handling in your generators

### Code Generation Hooks

You can tap into these code generation events:

1. **Pre-generation**
   ```javascript
   document.addEventListener('beforeCodeGeneration', (event) => {
       const config = event.detail;
       // Modify config or perform validation
   });
   ```

2. **Post-generation**
   ```javascript
   document.addEventListener('afterCodeGeneration', (event) => {
       const { code, config } = event.detail;
       // Process generated code
   });
   ```

### Best Practices for Contributors

1. **Code Generation**
   - Always include necessary using statements
   - Follow C# naming conventions
   - Add XML documentation comments
   - Include proper exception handling
   - Support async/await patterns

2. **Template Design**
   - Keep templates modular and reusable
   - Use consistent indentation
   - Support both single and batch operations
   - Include validation logic

3. **UI Integration**
   - Follow the existing UI patterns
   - Support both light and dark themes
   - Maintain responsive design
   - Add appropriate tooltips and documentation

### Testing Your Contributions

1. Test your pattern with different configurations:
   - Various entity names and field combinations
   - All HTTP methods
   - With and without authorization/validation
   - Different namespace configurations
   - Various dependency combinations

2. Verify the generated code:
   - Compiles without errors
   - Follows best practices
   - Maintains consistent styling
   - Includes all necessary dependencies

### Example: Adding a New Pattern

Here's a complete example of adding a new pattern:

```javascript
// newPattern.js
class NewPatternGenerator {
    generateCode(config) {
        const { entityName, httpMethod, dtoFields } = config;
        
        // Generate DTO
        const dtoCode = this.generateDto(entityName, dtoFields);
        
        // Generate Service
        const serviceCode = this.generateService(entityName);
        
        // Generate Controller
        const controllerCode = this.generateController(entityName, httpMethod);
        
        return `${dtoCode}\n\n${serviceCode}\n\n${controllerCode}`;
    }
    
    generateDto(entityName, fields) {
        // DTO generation logic
    }
    
    generateService(entityName) {
        // Service generation logic
    }
    
    generateController(entityName, httpMethod) {
        // Controller generation logic
    }
}

// Register the pattern
window.patternGenerators = {
    ...window.patternGenerators,
    newPattern: new NewPatternGenerator()
};
```


## Acknowledgments

Built with:
- Tailwind CSS
- Modern JavaScript
- Animate.css

---

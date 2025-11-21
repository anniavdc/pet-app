import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pet App API',
      version: '1.0.0',
      description: 'Backend API for Pet Weight Tracking Application',
      contact: {
        name: 'Pet App Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Pets',
        description: 'Pet management endpoints',
      },
      {
        name: 'Weights',
        description: 'Pet weight tracking endpoints',
      },
    ],
    components: {
      schemas: {
        Pet: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Pet unique identifier (UUIDv7)',
              example: '018c8f8e-7b4a-7890-abcd-ef1234567890',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Pet name',
              example: 'Max',
            },
          },
        },
        CreatePet: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Pet name (2-50 characters, cannot be only whitespace)',
              example: 'Max',
            },
          },
        },
        Weight: {
          type: 'object',
          required: ['id', 'petId', 'weight', 'date'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Weight record unique identifier (UUIDv7)',
              example: '018c8f8e-7b4a-7890-abcd-ef1234567891',
            },
            petId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated pet ID',
              example: '018c8f8e-7b4a-7890-abcd-ef1234567890',
            },
            weight: {
              type: 'number',
              minimum: 0.01,
              maximum: 1000,
              description: 'Weight in kilograms',
              example: 25.5,
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Measurement date (YYYY-MM-DD, cannot be in the future)',
              example: '2023-11-20',
            },
          },
        },
        CreateWeight: {
          type: 'object',
          required: ['weight', 'date'],
          properties: {
            weight: {
              type: 'number',
              minimum: 0.01,
              maximum: 1000,
              description: 'Weight in kilograms (0.01-1000)',
              example: 25.5,
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Measurement date (YYYY-MM-DD, cannot be in the future)',
              example: '2023-11-20',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Validation failed',
            },
            details: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['name must be longer than or equal to 2 characters'],
            },
          },
        },
        NotFoundError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Pet with id 123e4567-e89b-12d3-a456-426614174000 not found',
            },
          },
        },
        InternalError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Internal server error',
            },
          },
        },
      },
    },
  },
  apis: [
    './src/presentation/controllers/*.ts',
    './dist/presentation/controllers/*.js',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

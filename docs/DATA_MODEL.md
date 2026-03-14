# Data Model

## Learning Script

```typescript
{
  day: number,
  title: string,
  goal: string,
  script: string
}
```

## Progress (MongoDB Schema)

```typescript
{
  userId: string,           // User identifier
  selectedDay: number,      // Current day (1-15)
  days: {
    [dayId: number]: {
      completed: boolean,
      confidence: number,   // 0-5 scale
      notes: string,
      transcript: string,
      aiFeedback: string,
      vocabulary: string,
      audioEntries: [
        {
          id: string,
          name: string,
          url: string,
          createdAt: string,
          source: 'recorded' | 'uploaded',
          size: number
        }
      ]
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Storage

- **Primary**: MongoDB (persistent, server-side)
- **Cache**: Redux + localStorage (client-side)
- **Sync**: Automatic via DatabaseSync component
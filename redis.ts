// Import ioredis.
// You can also use `import { Redis } from "ioredis"`
// if your project is a TypeScript project,
// Note that `import Redis from "ioredis"` is still supported,
// but will be deprecated in the next major version.
import Redis from "ioredis";

// Create a Redis instance.
// By default, it will connect to localhost:6379.
// We are going to cover how to specify connection options soon.
const redis = new Redis();

const tasks = [
  { id: 1, name: "Click", username: "jake", priority: 3, subpriority: 2 },
  { id: 2, name: "Click", username: "parth", priority: 1, subpriority: 2 },
  { id: 3, name: "Click", username: "sarah", priority: 2, subpriority: 2 },
  { id: 3, name: "Cluck", username: "sarah", priority: 2, subpriority: 2 },
  { id: 4, name: "Clack", username: "parth", priority: 1, subpriority: 1 },
];

// All arguments are passed directly to the redis server,
// so technically ioredis supports all Redis commands.
// The format is: redis[SOME_REDIS_COMMAND_IN_LOWERCASE](ARGUMENTS_ARE_JOINED_INTO_COMMAND_STRING)
// so the following statement is equivalent to the CLI: `redis> SET mykey hello EX 10`
tasks.forEach(task => {
  console.log(`${task.priority}${task.subpriority}${Date.now()}`)
  redis.zadd("taskQueue", `${task.priority}${task.subpriority}${Date.now()}`, JSON.stringify(task));
});

const slurpTasks = async () => {
  const tasks = await redis.zrange("taskQueue", 0, -1);
  tasks.forEach(task => {
    console.log("Processing slurped task:", JSON.parse(task));
  });
  // Optionally, you can remove the tasks from the queue after processing
  await redis.del("taskQueue");
};

// setInterval(slurpTasks, 1000); // 10000 milliseconds = 1 minute



// let redisStore = {
//   tasks: [] as any[],
//   addTask: (task: any) => {
//     redisStore.subscribe("addtask", task)
//     redisStore.tasks.push(task);
//   },
//   getTasks: () => {
//     return redisStore.tasks;
//   },
//   removeTask: (task: any) => {
//     redisStore.subscribe("removeTask", task)
//     redisStore.tasks = redisStore.tasks.filter((t: any) => t.id !== task.id);
//   },
//   // persistence function
//   initialize:  () => {
//     redisStore.internalInterval = setInterval(redisStore.snapshot, 10000)
//     redisStore = load("./persistence.json")
//   },
//   internalInterval: null as any,
//   snapshot: () => {
//     save("./persistence.json", redisStore);
//   },
//   subscribe: (action: string, message: any) => {
//     persistedStore[action] = message;
//   }
// }

// redisStore.initialize()
// // ... do some stuff
// clearInterval(redisStore.internalInterval)

// const persistedStore = {
//   addtask: [] as any[],
//   removeTask: [] as any[],
// }
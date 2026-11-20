import {
  closestCorners,
  pointerWithin,
  type CollisionDetection,
} from "@dnd-kit/core";

/**
 * Prefer whatever is under the pointer (needed for cross-column / cross-section
 * moves). When both a task and its parent column/section collide, keep the task
 * so drops can target a specific index.
 */
export const taskBoardCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  const collisions =
    pointerCollisions.length > 0 ? pointerCollisions : closestCorners(args);

  if (collisions.length === 0) return [];

  const taskHit = collisions.find((collision) => {
    const type = collision.data?.droppableContainer?.data?.current?.type;
    return type === "task";
  });
  if (taskHit) return [taskHit];

  const containerHit = collisions.find((collision) => {
    const type = collision.data?.droppableContainer?.data?.current?.type;
    return type === "column" || type === "section";
  });
  if (containerHit) return [containerHit];

  return collisions;
};

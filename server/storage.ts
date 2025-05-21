import { users, type User, type InsertUser, buildingProjects, type BuildingProject, type InsertBuildingProject } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Building project methods
  getBuildingProject(id: number): Promise<BuildingProject | undefined>;
  getBuildingProjectByName(name: string): Promise<BuildingProject | undefined>;
  getAllBuildingProjects(): Promise<BuildingProject[]>;
  createBuildingProject(project: InsertBuildingProject): Promise<BuildingProject>;
  updateBuildingProject(id: number, project: Partial<InsertBuildingProject>): Promise<BuildingProject | undefined>;
  deleteBuildingProject(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Building project methods
  async getBuildingProject(id: number): Promise<BuildingProject | undefined> {
    const [project] = await db.select().from(buildingProjects).where(eq(buildingProjects.id, id));
    return project;
  }
  
  async getBuildingProjectByName(name: string): Promise<BuildingProject | undefined> {
    const [project] = await db.select().from(buildingProjects).where(eq(buildingProjects.name, name));
    return project;
  }
  
  async getAllBuildingProjects(): Promise<BuildingProject[]> {
    return await db.select().from(buildingProjects);
  }
  
  async createBuildingProject(project: InsertBuildingProject): Promise<BuildingProject> {
    const [createdProject] = await db.insert(buildingProjects).values(project).returning();
    return createdProject;
  }
  
  async updateBuildingProject(id: number, project: Partial<InsertBuildingProject>): Promise<BuildingProject | undefined> {
    const [updatedProject] = await db
      .update(buildingProjects)
      .set(project)
      .where(eq(buildingProjects.id, id))
      .returning();
    return updatedProject;
  }
  
  async deleteBuildingProject(id: number): Promise<boolean> {
    const result = await db
      .delete(buildingProjects)
      .where(eq(buildingProjects.id, id));
    return true; // In PostgreSQL, if no error is thrown, the operation was successful
  }
}

export const storage = new DatabaseStorage();

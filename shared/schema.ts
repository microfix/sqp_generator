import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Building projects table (anlæg)
export const buildingProjects = pgTable("building_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  pdfName: text("pdf_name").notNull(),
  documentNumberLeft: text("document_number_left").notNull(),
  documentNumberCenter: text("document_number_center").notNull(),
  projectType: text("project_type", { enum: ["HVAC", "BU"] }).notNull().default("HVAC"),
});

export const insertBuildingProjectSchema = createInsertSchema(buildingProjects).pick({
  name: true,
  documentNumberLeft: true,
  documentNumberCenter: true,
  projectType: true,
}).extend({
  // pdfName will be auto-generated, so we don't include it in the insert schema
});

export type InsertBuildingProject = z.infer<typeof insertBuildingProjectSchema>;
export type BuildingProject = typeof buildingProjects.$inferSelect;

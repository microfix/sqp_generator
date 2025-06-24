import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";

// Import the building project schemas
import { insertBuildingProjectSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve standard cover PDF
  app.get('/standard_forside.pdf', (req, res) => {
    const filePath = path.join(process.cwd(), 'standard_forside.pdf');
    console.log('Attempting to serve standard_forside.pdf from:', filePath);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.log('Standard forside not found at:', filePath);
        res.status(404).send('Standard forside not found');
      } else {
        console.log('Successfully served standard_forside.pdf');
      }
    });
  });
  // Building Projects API Routes
  
  // Get all building projects
  app.get("/api/building-projects", async (req, res) => {
    try {
      const projects = await storage.getAllBuildingProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching building projects:", error);
      res.status(500).json({ error: "Failed to fetch building projects" });
    }
  });
  
  // Get a specific building project by ID
  app.get("/api/building-projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      const project = await storage.getBuildingProject(id);
      if (!project) {
        return res.status(404).json({ error: "Building project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching building project:", error);
      res.status(500).json({ error: "Failed to fetch building project" });
    }
  });
  
  // Create a new building project
  app.post("/api/building-projects", async (req, res) => {
    try {
      const result = insertBuildingProjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }
      
      // Ensure pdfName is included - it should be auto-generated on frontend
      if (!result.data.pdfName && result.data.name && result.data.projectType) {
        // Extract name without project type prefix for PDF name generation
        const nameWithoutPrefix = result.data.name.replace(/^(HVAC |BU )/, "");
        result.data.pdfName = `${nameWithoutPrefix} ${result.data.projectType} SQP`;
      }
      
      const project = await storage.createBuildingProject(result.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating building project:", error);
      res.status(500).json({ error: "Failed to create building project" });
    }
  });
  
  // Update an existing building project
  app.patch("/api/building-projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      const updateSchema = insertBuildingProjectSchema.partial();
      const result = updateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }
      
      const updatedProject = await storage.updateBuildingProject(id, result.data);
      if (!updatedProject) {
        return res.status(404).json({ error: "Building project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating building project:", error);
      res.status(500).json({ error: "Failed to update building project" });
    }
  });
  
  // Delete a building project
  app.delete("/api/building-projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      const success = await storage.deleteBuildingProject(id);
      if (!success) {
        return res.status(404).json({ error: "Building project not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting building project:", error);
      res.status(500).json({ error: "Failed to delete building project" });
    }
  });
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}

import { Router } from 'express';
import { GraphService } from './services/graphService.js';
import { getDriver } from './db.js';

export const router = Router();
const graphService = new GraphService();

router.get('/health', async (req, res) => {
  try {
    const driver = getDriver();
    await driver.verifyConnectivity();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(503).json({ status: 'error', database: 'disconnected', message: 'The graph database is currently unavailable.' });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const stats = await graphService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

router.get('/skills', async (req, res) => {
  try {
    const skills = await graphService.getSkills();
    res.json(skills);
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

router.get('/skills/:id', async (req, res) => {
  try {
    const skill = await graphService.getSkillById(req.params.id);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    res.json(skill);
  } catch (error) {
    console.error(`Failed to fetch skill ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch skill' });
  }
});

router.get('/skills/:id/developers', async (req, res) => {
  try {
    const developers = await graphService.getSkillDevelopers(req.params.id);
    res.json(developers);
  } catch (error) {
    console.error(`Failed to fetch developers for skill ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch developers for skill' });
  }
});

router.get('/skills/:id/projects', async (req, res) => {
  try {
    const projects = await graphService.getSkillProjects(req.params.id);
    res.json(projects);
  } catch (error) {
    console.error(`Failed to fetch projects for skill ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch projects for skill' });
  }
});

router.get('/skills/:id/related', async (req, res) => {
  try {
    const related = await graphService.getSkillRelated(req.params.id);
    res.json(related);
  } catch (error) {
    console.error(`Failed to fetch related skills for ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch related skills' });
  }
});

router.get('/developers', async (req, res) => {
  try {
    const developers = await graphService.getDevelopers();
    res.json(developers);
  } catch (error) {
    console.error('Failed to fetch developers:', error);
    res.status(500).json({ error: 'Failed to fetch developers' });
  }
});

router.get('/developers/:id', async (req, res) => {
  try {
    const developer = await graphService.getDeveloperById(req.params.id);
    if (!developer) return res.status(404).json({ error: 'Developer not found' });
    res.json(developer);
  } catch (error) {
    console.error(`Failed to fetch developer ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch developer' });
  }
});

router.get('/developers/:id/skills', async (req, res) => {
  try {
    const skills = await graphService.getDeveloperSkills(req.params.id);
    res.json(skills);
  } catch (error) {
    console.error(`Failed to fetch skills for developer ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch developer skills' });
  }
});

router.get('/developers/:id/projects', async (req, res) => {
  try {
    const projects = await graphService.getDeveloperProjects(req.params.id);
    res.json(projects);
  } catch (error) {
    console.error(`Failed to fetch projects for developer ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch developer projects' });
  }
});

router.get('/developers/:id/similar', async (req, res) => {
  try {
    const similar = await graphService.getSimilarDevelopers(req.params.id);
    res.json(similar);
  } catch (error) {
    console.error(`Failed to fetch similar developers for ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch similar developers' });
  }
});

router.get('/developers/:id/recommendations', async (req, res) => {
  try {
    const recommendations = await graphService.getDeveloperRecommendations(req.params.id);
    res.json(recommendations);
  } catch (error) {
    console.error(`Failed to fetch recommendations for ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

router.get('/developers/:id/indirect-skills', async (req, res) => {
  try {
    const indirectSkills = await graphService.getIndirectUsefulSkills(req.params.id);
    res.json(indirectSkills);
  } catch (error) {
    console.error(`Failed to fetch indirect skills for ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch indirect skills' });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const projects = await graphService.getProjects();
    res.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const project = await graphService.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    console.error(`Failed to fetch project ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.get('/job-roles', async (req, res) => {
  try {
    const roles = await graphService.getJobRoles();
    res.json(roles);
  } catch (error) {
    console.error('Failed to fetch job roles:', error);
    res.status(500).json({ error: 'Failed to fetch job roles' });
  }
});

router.get('/career-path', async (req, res) => {
  const { developerId, jobRoleId } = req.query;
  if (!developerId || !jobRoleId) {
    return res.status(400).json({ error: 'Missing developerId or jobRoleId' });
  }
  try {
    const path = await graphService.getCareerPath(developerId as string, jobRoleId as string);
    res.json(path);
  } catch (error) {
    console.error('Failed to fetch career path:', error);
    res.status(500).json({ error: 'Failed to fetch career path' });
  }
});

router.get('/graph/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    const graph = await graphService.getGraphData(type, id);
    res.json(graph);
  } catch (error) {
    console.error(`Failed to fetch graph data for ${type}/${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch graph data' });
  }
});

router.post('/developers', async (req, res) => {
  try {
    const dev = await graphService.createDeveloper(req.body);
    res.status(201).json(dev);
  } catch (error) {
    console.error('Failed to create developer:', error);
    res.status(500).json({ error: 'Failed to create developer' });
  }
});

router.post('/skills', async (req, res) => {
  try {
    const skill = await graphService.createSkill(req.body);
    res.status(201).json(skill);
  } catch (error) {
    console.error('Failed to create skill:', error);
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const project = await graphService.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    console.error('Failed to create project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/developers/:id', async (req, res) => {
  try {
    const dev = await graphService.updateDeveloper(req.params.id, req.body);
    if (!dev) return res.status(404).json({ error: 'Developer not found' });
    res.json(dev);
  } catch (error) {
    console.error(`Failed to update developer ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update developer' });
  }
});

router.delete('/developers/:id', async (req, res) => {
  try {
    const result = await graphService.deleteDeveloper(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(`Failed to delete developer ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete developer' });
  }
});

router.post('/developers/:id/skills', async (req, res) => {
  const { skillId, proficiency, years } = req.body;
  if (!skillId) return res.status(400).json({ error: 'Missing skillId' });
  try {
    const result = await graphService.addSkillToDeveloper(req.params.id, skillId, proficiency || 'Intermediate', years || 1);
    res.json(result);
  } catch (error) {
    console.error(`Failed to add skill to developer ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to add skill to developer' });
  }
});

router.delete('/developers/:id/skills/:skillId', async (req, res) => {
  try {
    const result = await graphService.removeSkillFromDeveloper(req.params.id, req.params.skillId);
    res.json(result);
  } catch (error) {
    console.error(`Failed to remove skill from developer ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to remove skill from developer' });
  }
});

router.put('/skills/:id', async (req, res) => {
  try {
    const skill = await graphService.updateSkill(req.params.id, req.body);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    res.json(skill);
  } catch (error) {
    console.error(`Failed to update skill ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

router.delete('/skills/:id', async (req, res) => {
  try {
    const result = await graphService.deleteSkill(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(`Failed to delete skill ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

router.get('/companies', async (req, res) => {
  try {
    const companies = await graphService.getCompanies();
    res.json(companies);
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

router.get('/companies/:id', async (req, res) => {
  try {
    const company = await graphService.getCompanyById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    console.error(`Failed to fetch company ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

router.post('/companies', async (req, res) => {
  try {
    const company = await graphService.createCompany(req.body);
    res.status(201).json(company);
  } catch (error) {
    console.error('Failed to create company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

router.put('/companies/:id', async (req, res) => {
  try {
    const company = await graphService.updateCompany(req.params.id, req.body);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    console.error(`Failed to update company ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

router.delete('/companies/:id', async (req, res) => {
  try {
    const result = await graphService.deleteCompany(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(`Failed to delete company ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const project = await graphService.updateProject(req.params.id, req.body);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    console.error(`Failed to update project ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const result = await graphService.deleteProject(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(`Failed to delete project ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

import neo4j from 'neo4j-driver';
import { getDriver } from '../db.js';

function formatVal(val: any): any {
  if (val === null || val === undefined) return val;
  if (neo4j.isInt(val)) return val.toNumber();
  if (typeof val === 'object' && typeof val.toNumber === 'function') return val.toNumber();
  if (typeof val === 'object' && 'low' in val && typeof val.low === 'number') return val.low;
  if (Array.isArray(val)) return val.map(formatVal);
  if (typeof val === 'object' && val.constructor === Object) {
    const formatted: any = {};
    for (const [k, v] of Object.entries(val)) {
      formatted[k] = formatVal(v);
    }
    return formatted;
  }
  return val;
}

function formatProps(props: any): any {
  return formatVal(props);
}

export class GraphService {
  async runQuery(query: string, params: any = {}) {
    const driver = getDriver();
    const session = driver.session();
    try {
      const result = await session.run(query, params);
      return result.records;
    } finally {
      await session.close();
    }
  }

  // Dashboard Stats
  async getDashboardStats() {
    const query = `
      MATCH (d:Developer) WITH count(d) AS developers
      MATCH (s:Skill) WITH developers, count(s) AS skills
      MATCH (p:Project) WITH developers, skills, count(p) AS projects
      MATCH (c:Company) WITH developers, skills, projects, count(c) AS companies
      MATCH (j:JobRole) WITH developers, skills, projects, companies, count(j) AS jobRoles
      RETURN developers, skills, projects, companies, jobRoles
    `;
    const records = await this.runQuery(query);
    if (records.length === 0) return null;
    const r = records[0];
    return {
      developers: formatVal(r.get('developers')),
      skills: formatVal(r.get('skills')),
      projects: formatVal(r.get('projects')),
      companies: formatVal(r.get('companies')),
      jobRoles: formatVal(r.get('jobRoles')),
    };
  }

  // Skills
  async getSkills() {
    const query = `
      MATCH (s:Skill)
      OPTIONAL MATCH (d:Developer)-[:HAS_SKILL]->(s)
      OPTIONAL MATCH (p:Project)-[:USES_SKILL]->(s)
      OPTIONAL MATCH (s)-[:RELATED_TO]-(related:Skill)
      RETURN s, count(DISTINCT d) as developerCount, count(DISTINCT p) as projectCount, count(DISTINCT related) as relatedCount
      ORDER BY s.name ASC
    `;
    const records = await this.runQuery(query);
    return records.map(r => ({
      ...formatProps(r.get('s').properties),
      developerCount: formatVal(r.get('developerCount')),
      projectCount: formatVal(r.get('projectCount')),
      relatedCount: formatVal(r.get('relatedCount')),
    }));
  }

  async getSkillById(skillId: string) {
    const query = `MATCH (s:Skill {id: $skillId}) RETURN s`;
    const records = await this.runQuery(query, { skillId });
    return records.length ? formatProps(records[0].get('s').properties) : null;
  }
  
  async getSkillDevelopers(skillId: string) {
    const query = `
      MATCH (d:Developer)-[:HAS_SKILL]->(s:Skill {id: $skillId})
      RETURN d
    `;
    const records = await this.runQuery(query, { skillId });
    return records.map(r => formatProps(r.get('d').properties));
  }

  async getSkillProjects(skillId: string) {
    const query = `
      MATCH (p:Project)-[:USES_SKILL]->(s:Skill {id: $skillId})
      RETURN p
    `;
    const records = await this.runQuery(query, { skillId });
    return records.map(r => formatProps(r.get('p').properties));
  }

  async getSkillCompanies(skillId: string) {
    const query = `
      MATCH (c:Company)<-[:BUILT_FOR]-(:Project)-[:USES_SKILL]->(s:Skill {id: $skillId})
      RETURN DISTINCT c
    `;
    const records = await this.runQuery(query, { skillId });
    return records.map(r => formatProps(r.get('c').properties));
  }
  
  async getSkillRelated(skillId: string) {
    const query = `
      MATCH (s:Skill {id: $skillId})-[:RELATED_TO]-(related:Skill)
      RETURN related
    `;
    const records = await this.runQuery(query, { skillId });
    return records.map(r => formatProps(r.get('related').properties));
  }

  async getSkillJobRoles(skillId: string) {
    const query = `
      MATCH (j:JobRole)-[:REQUIRES_SKILL]->(s:Skill {id: $skillId})
      RETURN j
    `;
    const records = await this.runQuery(query, { skillId });
    return records.map(r => formatProps(r.get('j').properties));
  }

  // Developers
  async getDevelopers() {
    const query = `
      MATCH (d:Developer)
      OPTIONAL MATCH (d)-[:WORKS_AT]->(c:Company)
      OPTIONAL MATCH (d)-[:HAS_SKILL]->(s:Skill)
      WITH d, collect(DISTINCT c) AS companies, collect(DISTINCT s) AS skills
      RETURN d, companies[0] AS company, skills
      ORDER BY d.name ASC
    `;
    const records = await this.runQuery(query);
    return records.map(r => ({
      ...formatProps(r.get('d').properties),
      company: r.get('company') ? formatProps(r.get('company').properties) : null,
      skills: r.get('skills').map((s: any) => formatProps(s.properties))
    }));
  }

  async getDeveloperById(developerId: string) {
    const query = `
      MATCH (d:Developer {id: $developerId})
      OPTIONAL MATCH (d)-[:WORKS_AT]->(c:Company)
      RETURN d, c
    `;
    const records = await this.runQuery(query, { developerId });
    if (!records.length) return null;
    return {
      ...formatProps(records[0].get('d').properties),
      company: records[0].get('c') ? formatProps(records[0].get('c').properties) : null,
    };
  }

  async getDeveloperSkills(developerId: string) {
    const query = `
      MATCH (d:Developer {id: $developerId})-[r:HAS_SKILL]->(s:Skill)
      RETURN s, r.proficiency AS proficiency, r.years AS years
    `;
    const records = await this.runQuery(query, { developerId });
    return records.map(r => ({
      ...formatProps(r.get('s').properties),
      proficiency: r.get('proficiency'),
      years: formatVal(r.get('years'))
    }));
  }

  async getDeveloperProjects(developerId: string) {
    const query = `
      MATCH (d:Developer {id: $developerId})-[r:WORKED_ON]->(p:Project)
      RETURN p, r.role AS role
    `;
    const records = await this.runQuery(query, { developerId });
    return records.map(r => ({
      ...formatProps(r.get('p').properties),
      role: r.get('role')
    }));
  }

  // Similar Developers
  async getSimilarDevelopers(developerId: string) {
    const query = `
      MATCH (d:Developer {id: $developerId})-[:HAS_SKILL]->(s:Skill)
      MATCH (other:Developer)-[:HAS_SKILL]->(s)
      WHERE d <> other
      WITH other, count(s) as sharedSkills, collect(s.name) as sharedSkillNames
      ORDER BY sharedSkills DESC
      RETURN other, sharedSkills, sharedSkillNames
    `;
    const records = await this.runQuery(query, { developerId });
    return records.map(r => ({
      ...formatProps(r.get('other').properties),
      sharedSkills: formatVal(r.get('sharedSkills')),
      sharedSkillNames: r.get('sharedSkillNames')
    }));
  }

  // Skill recommendations for developer
  async getDeveloperRecommendations(developerId: string) {
    const query = `
      MATCH (d:Developer {id: $developerId})-[:HAS_SKILL]->(known:Skill)-[:RELATED_TO]-(recommended:Skill)
      WHERE NOT (d)-[:HAS_SKILL]->(recommended)
      WITH recommended, count(known) as connectionStrength, collect(known.name) as relatedKnownSkills
      ORDER BY connectionStrength DESC
      RETURN recommended, connectionStrength, relatedKnownSkills
    `;
    const records = await this.runQuery(query, { developerId });
    return records.map(r => ({
      ...formatProps(r.get('recommended').properties),
      connectionStrength: formatVal(r.get('connectionStrength')),
      relatedKnownSkills: r.get('relatedKnownSkills')
    }));
  }

  // Projects
  async getProjects() {
    const query = `
      MATCH (p:Project)
      OPTIONAL MATCH (p)-[:BUILT_FOR]->(c:Company)
      OPTIONAL MATCH (p)-[:USES_SKILL]->(s:Skill)
      WITH p, collect(DISTINCT c) AS companies, collect(DISTINCT s) AS skills
      RETURN p, companies[0] AS company, skills
      ORDER BY p.name ASC
    `;
    const records = await this.runQuery(query);
    return records.map(r => ({
      ...formatProps(r.get('p').properties),
      company: r.get('company') ? formatProps(r.get('company').properties) : null,
      skills: r.get('skills').map((s: any) => formatProps(s.properties))
    }));
  }

  async getProjectById(projectId: string) {
    const query = `
      MATCH (p:Project {id: $projectId})
      OPTIONAL MATCH (p)-[:BUILT_FOR]->(c:Company)
      RETURN p, c
    `;
    const records = await this.runQuery(query, { projectId });
    if (!records.length) return null;
    return {
      ...formatProps(records[0].get('p').properties),
      company: records[0].get('c') ? formatProps(records[0].get('c').properties) : null,
    };
  }

  // Career Path (Query 6)
  async getCareerPath(developerId: string, jobRoleId: string) {
    const query = `
      MATCH (d:Developer {id: $developerId})
      MATCH (j:JobRole {id: $jobRoleId})
      MATCH (j)-[:REQUIRES_SKILL]->(required:Skill)
      WHERE NOT (d)-[:HAS_SKILL]->(required)
      OPTIONAL MATCH (d)-[:HAS_SKILL]->(known:Skill)-[:RELATED_TO]-(required)
      WITH required, collect(known) as connectedKnownSkills
      RETURN required, connectedKnownSkills
    `;
    const records = await this.runQuery(query, { developerId, jobRoleId });
    return records.map(r => ({
      requiredSkill: formatProps(r.get('required').properties),
      connectedKnownSkills: r.get('connectedKnownSkills').map((s: any) => formatProps(s.properties))
    }));
  }
  
  // Job Roles
  async getJobRoles() {
    const query = `MATCH (j:JobRole) RETURN j`;
    const records = await this.runQuery(query);
    return records.map(r => formatProps(r.get('j').properties));
  }

  // Graph Explorer
  async getGraphData(entityType: string, entityId: string) {
    const query = `
      MATCH (n {id: $entityId})-[r]-(m)
      RETURN n, r, m
    `;
    const records = await this.runQuery(query, { entityId });
    
    const nodes = new Map();
    const links: any[] = [];
    
    records.forEach(record => {
      const n = record.get('n');
      const m = record.get('m');
      const r = record.get('r');
      
      const nData = { ...formatProps(n.properties), label: n.labels[0] };
      const mData = { ...formatProps(m.properties), label: m.labels[0] };
      
      nodes.set(nData.id, nData);
      nodes.set(mData.id, mData);
      
      links.push({
        source: nData.id,
        target: mData.id,
        type: r.type,
        properties: formatProps(r.properties)
      });
    });

    if (nodes.size === 0) {
      const singleQ = `MATCH (n {id: $entityId}) RETURN n`;
      const singleR = await this.runQuery(singleQ, { entityId });
      if (singleR.length) {
         const n = singleR[0].get('n');
         nodes.set(n.properties.id, { ...formatProps(n.properties), label: n.labels[0] });
      }
    }
    
    return {
      nodes: Array.from(nodes.values()),
      links
    };
  }

  // Query 7 - Relationally awkward query
  async getIndirectUsefulSkills(developerId: string) {
    const query = `
      MATCH (d:Developer {id: $developerId})-[:HAS_SKILL]->(known:Skill)
      MATCH (known)-[:RELATED_TO*1..2]-(indirect:Skill)
      WHERE NOT (d)-[:HAS_SKILL]->(indirect)
      MATCH (indirect)<-[:REQUIRES_SKILL]-(j:JobRole)
      WITH indirect, collect(DISTINCT j.title) as usefulForRoles, count(DISTINCT known) as pathCount
      ORDER BY pathCount DESC
      RETURN indirect, usefulForRoles, pathCount
    `;
    const records = await this.runQuery(query, { developerId });
    return records.map(r => ({
      ...formatProps(r.get('indirect').properties),
      usefulForRoles: r.get('usefulForRoles'),
      pathCount: formatVal(r.get('pathCount'))
    }));
  }

  // Companies
  async getCompanies() {
    const query = `
      MATCH (c:Company)
      OPTIONAL MATCH (d:Developer)-[:WORKS_AT]->(c)
      OPTIONAL MATCH (p:Project)-[:BUILT_FOR]->(c)
      OPTIONAL MATCH (c)-[:HIRING_FOR]->(j:JobRole)
      WITH c, count(DISTINCT d) AS devCount, count(DISTINCT p) AS projCount, count(DISTINCT j) AS roleCount
      RETURN c, devCount, projCount, roleCount
      ORDER BY c.name
    `;
    const records = await this.runQuery(query);
    return records.map(r => ({
      ...formatProps(r.get('c').properties),
      developerCount: formatVal(r.get('devCount')),
      projectCount: formatVal(r.get('projCount')),
      roleCount: formatVal(r.get('roleCount'))
    }));
  }

  async getCompanyById(id: string) {
    const query = `
      MATCH (c:Company {id: $id})
      OPTIONAL MATCH (d:Developer)-[:WORKS_AT]->(c)
      OPTIONAL MATCH (p:Project)-[:BUILT_FOR]->(c)
      OPTIONAL MATCH (c)-[:HIRING_FOR]->(j:JobRole)
      RETURN c, collect(DISTINCT d) AS developers, collect(DISTINCT p) AS projects, collect(DISTINCT j) AS jobRoles
    `;
    const records = await this.runQuery(query, { id });
    if (records.length === 0) return null;
    const r = records[0];
    const companyNode = r.get('c');
    if (!companyNode) return null;

    const devs = r.get('developers').filter((d: any) => d !== null).map((d: any) => formatProps(d.properties));
    const projs = r.get('projects').filter((p: any) => p !== null).map((p: any) => formatProps(p.properties));
    const roles = r.get('jobRoles').filter((j: any) => j !== null).map((j: any) => formatProps(j.properties));

    return {
      ...formatProps(companyNode.properties),
      developers: devs,
      projects: projs,
      jobRoles: roles
    };
  }

  async createCompany(data: { name: string; industry: string; location: string; developerIds?: string[]; projectIds?: string[]; roleIds?: string[] }) {
    const id = `company-${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const query = `
      CREATE (c:Company {
        id: $id, 
        name: $name, 
        industry: $industry, 
        location: $location
      })
      WITH c
      UNWIND (CASE WHEN $developerIds IS NULL OR size($developerIds) = 0 THEN [null] ELSE $developerIds END) AS dId
      OPTIONAL MATCH (d:Developer {id: dId})
      FOREACH (_ IN CASE WHEN d IS NOT NULL THEN [1] ELSE [] END | CREATE (d)-[:WORKS_AT]->(c))
      WITH c
      UNWIND (CASE WHEN $projectIds IS NULL OR size($projectIds) = 0 THEN [null] ELSE $projectIds END) AS pId
      OPTIONAL MATCH (p:Project {id: pId})
      FOREACH (_ IN CASE WHEN p IS NOT NULL THEN [1] ELSE [] END | CREATE (p)-[:BUILT_FOR]->(c))
      WITH c
      UNWIND (CASE WHEN $roleIds IS NULL OR size($roleIds) = 0 THEN [null] ELSE $roleIds END) AS rId
      OPTIONAL MATCH (j:JobRole {id: rId})
      FOREACH (_ IN CASE WHEN j IS NOT NULL THEN [1] ELSE [] END | CREATE (c)-[:HIRING_FOR]->(j))
      RETURN c
    `;
    const records = await this.runQuery(query, {
      id,
      name: data.name,
      industry: data.industry,
      location: data.location,
      developerIds: data.developerIds || [],
      projectIds: data.projectIds || [],
      roleIds: data.roleIds || []
    });
    return formatProps(records[0].get('c').properties);
  }

  async updateCompany(id: string, data: { name: string; industry: string; location: string }) {
    const query = `
      MATCH (c:Company {id: $id})
      SET c.name = $name, c.industry = $industry, c.location = $location
      RETURN c
    `;
    const records = await this.runQuery(query, {
      id,
      name: data.name,
      industry: data.industry,
      location: data.location
    });
    return records.length ? formatProps(records[0].get('c').properties) : null;
  }

  async deleteCompany(id: string) {
    const query = `MATCH (c:Company {id: $id}) DETACH DELETE c`;
    await this.runQuery(query, { id });
    return { success: true, id };
  }

  // Create Node Mutations
  async createDeveloper(data: { name: string; experience_years: number; location: string; bio: string; companyId?: string; skillIds?: string[] }) {
    const id = `dev-${Date.now()}`;
    const query = `
      CREATE (d:Developer {
        id: $id, 
        name: $name, 
        experience_years: toInteger($experience_years), 
        location: $location, 
        bio: $bio
      })
      WITH d
      OPTIONAL MATCH (c:Company {id: $companyId})
      FOREACH (_ IN CASE WHEN c IS NOT NULL THEN [1] ELSE [] END | CREATE (d)-[:WORKS_AT]->(c))
      WITH d
      UNWIND (CASE WHEN $skillIds IS NULL OR size($skillIds) = 0 THEN [null] ELSE $skillIds END) AS sId
      OPTIONAL MATCH (s:Skill {id: sId})
      FOREACH (_ IN CASE WHEN s IS NOT NULL THEN [1] ELSE [] END | CREATE (d)-[:HAS_SKILL {proficiency: 'Intermediate', years: 2}]->(s))
      RETURN d
    `;
    const records = await this.runQuery(query, {
      id,
      name: data.name,
      experience_years: data.experience_years,
      location: data.location,
      bio: data.bio,
      companyId: data.companyId || null,
      skillIds: data.skillIds || []
    });
    return formatProps(records[0].get('d').properties);
  }

  async createSkill(data: { name: string; category: string; description: string }) {
    const id = `skill-${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const query = `
      CREATE (s:Skill {
        id: $id, 
        name: $name, 
        category: $category, 
        description: $description
      })
      RETURN s
    `;
    const records = await this.runQuery(query, {
      id,
      name: data.name,
      category: data.category,
      description: data.description
    });
    return formatProps(records[0].get('s').properties);
  }

  async createProject(data: { name: string; description: string; difficulty: string; year: number; companyId?: string; skillIds?: string[] }) {
    const id = `proj-${Date.now()}`;
    const query = `
      CREATE (p:Project {
        id: $id, 
        name: $name, 
        description: $description, 
        difficulty: $difficulty, 
        year: toInteger($year)
      })
      WITH p
      OPTIONAL MATCH (c:Company {id: $companyId})
      FOREACH (_ IN CASE WHEN c IS NOT NULL THEN [1] ELSE [] END | CREATE (p)-[:BUILT_FOR]->(c))
      WITH p
      UNWIND (CASE WHEN $skillIds IS NULL OR size($skillIds) = 0 THEN [null] ELSE $skillIds END) AS sId
      OPTIONAL MATCH (s:Skill {id: sId})
      FOREACH (_ IN CASE WHEN s IS NOT NULL THEN [1] ELSE [] END | CREATE (p)-[:USES_SKILL]->(s))
      RETURN p
    `;
    const records = await this.runQuery(query, {
      id,
      name: data.name,
      description: data.description,
      difficulty: data.difficulty,
      year: data.year,
      companyId: data.companyId || null,
      skillIds: data.skillIds || []
    });
    return formatProps(records[0].get('p').properties);
  }

  async updateProject(id: string, data: { name: string; description: string; difficulty: string; year: number }) {
    const query = `
      MATCH (p:Project {id: $id})
      SET p.name = $name, p.description = $description, p.difficulty = $difficulty, p.year = toInteger($year)
      RETURN p
    `;
    const records = await this.runQuery(query, {
      id,
      name: data.name,
      description: data.description,
      difficulty: data.difficulty,
      year: data.year
    });
    return records.length ? formatProps(records[0].get('p').properties) : null;
  }

  // Update & Delete Mutations
  async updateDeveloper(id: string, data: { name: string; experience_years: number; location: string; bio: string; companyId?: string }) {
    const query = `
      MATCH (d:Developer {id: $id})
      SET d.name = $name, d.experience_years = toInteger($experience_years), d.location = $location, d.bio = $bio
      WITH d
      OPTIONAL MATCH (d)-[r:WORKS_AT]->(:Company)
      DELETE r
      WITH d
      OPTIONAL MATCH (c:Company {id: $companyId})
      FOREACH (_ IN CASE WHEN c IS NOT NULL THEN [1] ELSE [] END | CREATE (d)-[:WORKS_AT]->(c))
      RETURN d
    `;
    const records = await this.runQuery(query, {
      id,
      name: data.name,
      experience_years: data.experience_years,
      location: data.location,
      bio: data.bio,
      companyId: data.companyId || null
    });
    return records.length ? formatProps(records[0].get('d').properties) : null;
  }

  async deleteDeveloper(id: string) {
    const query = `MATCH (d:Developer {id: $id}) DETACH DELETE d`;
    await this.runQuery(query, { id });
    return { success: true, id };
  }

  async updateSkill(id: string, data: { name: string; category: string; description: string }) {
    const query = `
      MATCH (s:Skill {id: $id})
      SET s.name = $name, s.category = $category, s.description = $description
      RETURN s
    `;
    const records = await this.runQuery(query, {
      id,
      name: data.name,
      category: data.category,
      description: data.description
    });
    return records.length ? formatProps(records[0].get('s').properties) : null;
  }

  async deleteSkill(id: string) {
    const query = `MATCH (s:Skill {id: $id}) DETACH DELETE s`;
    await this.runQuery(query, { id });
    return { success: true, id };
  }

  async deleteProject(id: string) {
    const query = `MATCH (p:Project {id: $id}) DETACH DELETE p`;
    await this.runQuery(query, { id });
    return { success: true, id };
  }

  // Relationship Mutations: HAS_SKILL
  async addSkillToDeveloper(developerId: string, skillId: string, proficiency: string, years: number) {
    const query = `
      MATCH (d:Developer {id: $developerId})
      MATCH (s:Skill {id: $skillId})
      MERGE (d)-[r:HAS_SKILL]->(s)
      SET r.proficiency = $proficiency, r.years = toInteger($years)
      RETURN d, r, s
    `;
    await this.runQuery(query, { developerId, skillId, proficiency, years });
    return { success: true, developerId, skillId };
  }

  async removeSkillFromDeveloper(developerId: string, skillId: string) {
    const query = `
      MATCH (d:Developer {id: $developerId})-[r:HAS_SKILL]->(s:Skill {id: $skillId})
      DELETE r
    `;
    await this.runQuery(query, { developerId, skillId });
    return { success: true, developerId, skillId };
  }
}

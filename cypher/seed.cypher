// Cypher script to seed the database

// 1. Create Skills
CREATE (react:Skill {id: 'skill-react', name: 'React', category: 'Frontend', description: 'A JavaScript library for building user interfaces'});
CREATE (ts:Skill {id: 'skill-ts', name: 'TypeScript', category: 'Language', description: 'Typed superset of JavaScript'});
CREATE (js:Skill {id: 'skill-js', name: 'JavaScript', category: 'Language', description: 'Core language of the web'});
CREATE (nextjs:Skill {id: 'skill-nextjs', name: 'Next.js', category: 'Frontend', description: 'The React Framework for Production'});
CREATE (nodejs:Skill {id: 'skill-nodejs', name: 'Node.js', category: 'Backend', description: 'JavaScript runtime built on V8'});
CREATE (python:Skill {id: 'skill-python', name: 'Python', category: 'Language', description: 'High-level programming language'});
CREATE (fastapi:Skill {id: 'skill-fastapi', name: 'FastAPI', category: 'Backend', description: 'Modern, fast web framework for building APIs with Python'});
CREATE (postgres:Skill {id: 'skill-postgres', name: 'PostgreSQL', category: 'Database', description: 'Open source relational database'});
CREATE (mongodb:Skill {id: 'skill-mongodb', name: 'MongoDB', category: 'Database', description: 'NoSQL document database'});
CREATE (redis:Skill {id: 'skill-redis', name: 'Redis', category: 'Database', description: 'In-memory data structure store'});
CREATE (docker:Skill {id: 'skill-docker', name: 'Docker', category: 'DevOps', description: 'OS-level virtualization for containers'});
CREATE (aws:Skill {id: 'skill-aws', name: 'AWS', category: 'Cloud', description: 'Amazon Web Services'});
CREATE (graphql:Skill {id: 'skill-graphql', name: 'GraphQL', category: 'API', description: 'Query language for APIs'});
CREATE (tailwind:Skill {id: 'skill-tailwind', name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework'});
CREATE (git:Skill {id: 'skill-git', name: 'Git', category: 'Tooling', description: 'Version control system'});
CREATE (k8s:Skill {id: 'skill-k8s', name: 'Kubernetes', category: 'DevOps', description: 'Container orchestration system'});

// 2. Skill Relationships (RELATED_TO)
MATCH (react:Skill {id: 'skill-react'}), (ts:Skill {id: 'skill-ts'}) CREATE (react)-[:RELATED_TO]->(ts);
MATCH (react:Skill {id: 'skill-react'}), (js:Skill {id: 'skill-js'}) CREATE (react)-[:RELATED_TO]->(js);
MATCH (react:Skill {id: 'skill-react'}), (nextjs:Skill {id: 'skill-nextjs'}) CREATE (react)-[:RELATED_TO]->(nextjs);
MATCH (ts:Skill {id: 'skill-ts'}), (js:Skill {id: 'skill-js'}) CREATE (ts)-[:RELATED_TO]->(js);
MATCH (ts:Skill {id: 'skill-ts'}), (nodejs:Skill {id: 'skill-nodejs'}) CREATE (ts)-[:RELATED_TO]->(nodejs);
MATCH (nextjs:Skill {id: 'skill-nextjs'}), (ts:Skill {id: 'skill-ts'}) CREATE (nextjs)-[:RELATED_TO]->(ts);
MATCH (nodejs:Skill {id: 'skill-nodejs'}), (js:Skill {id: 'skill-js'}) CREATE (nodejs)-[:RELATED_TO]->(js);
MATCH (python:Skill {id: 'skill-python'}), (fastapi:Skill {id: 'skill-fastapi'}) CREATE (python)-[:RELATED_TO]->(fastapi);
MATCH (docker:Skill {id: 'skill-docker'}), (k8s:Skill {id: 'skill-k8s'}) CREATE (docker)-[:RELATED_TO]->(k8s);
MATCH (postgres:Skill {id: 'skill-postgres'}), (redis:Skill {id: 'skill-redis'}) CREATE (postgres)-[:RELATED_TO]->(redis);
MATCH (graphql:Skill {id: 'skill-graphql'}), (ts:Skill {id: 'skill-ts'}) CREATE (graphql)-[:RELATED_TO]->(ts);
MATCH (react:Skill {id: 'skill-react'}), (tailwind:Skill {id: 'skill-tailwind'}) CREATE (react)-[:RELATED_TO]->(tailwind);

// 3. Create Companies
CREATE (c1:Company {id: 'company-acme', name: 'Acme Corp', industry: 'E-commerce', location: 'San Francisco'});
CREATE (c2:Company {id: 'company-globex', name: 'Globex', industry: 'Healthcare', location: 'New York'});
CREATE (c3:Company {id: 'company-soylent', name: 'Soylent Corp', industry: 'Food Tech', location: 'Remote'});
CREATE (c4:Company {id: 'company-initech', name: 'Initech', industry: 'Software', location: 'Austin'});

// 4. Create Job Roles
CREATE (j1:JobRole {id: 'role-frontend', title: 'Frontend Engineer', description: 'Build user interfaces', level: 'Mid'});
CREATE (j2:JobRole {id: 'role-backend', title: 'Backend Engineer', description: 'Build APIs and systems', level: 'Mid'});
CREATE (j3:JobRole {id: 'role-fullstack', title: 'Fullstack Engineer', description: 'End-to-end development', level: 'Senior'});
CREATE (j4:JobRole {id: 'role-devops', title: 'DevOps Engineer', description: 'Infrastructure and deployment', level: 'Mid'});
CREATE (j5:JobRole {id: 'role-data', title: 'Data Engineer', description: 'Data pipelines and databases', level: 'Senior'});

// 5. Job Role Skill Requirements
MATCH (j1:JobRole {id: 'role-frontend'}), (react:Skill {id: 'skill-react'}) CREATE (j1)-[:REQUIRES_SKILL]->(react);
MATCH (j1:JobRole {id: 'role-frontend'}), (ts:Skill {id: 'skill-ts'}) CREATE (j1)-[:REQUIRES_SKILL]->(ts);
MATCH (j1:JobRole {id: 'role-frontend'}), (tailwind:Skill {id: 'skill-tailwind'}) CREATE (j1)-[:REQUIRES_SKILL]->(tailwind);
MATCH (j2:JobRole {id: 'role-backend'}), (nodejs:Skill {id: 'skill-nodejs'}) CREATE (j2)-[:REQUIRES_SKILL]->(nodejs);
MATCH (j2:JobRole {id: 'role-backend'}), (postgres:Skill {id: 'skill-postgres'}) CREATE (j2)-[:REQUIRES_SKILL]->(postgres);
MATCH (j2:JobRole {id: 'role-backend'}), (redis:Skill {id: 'skill-redis'}) CREATE (j2)-[:REQUIRES_SKILL]->(redis);
MATCH (j3:JobRole {id: 'role-fullstack'}), (react:Skill {id: 'skill-react'}) CREATE (j3)-[:REQUIRES_SKILL]->(react);
MATCH (j3:JobRole {id: 'role-fullstack'}), (ts:Skill {id: 'skill-ts'}) CREATE (j3)-[:REQUIRES_SKILL]->(ts);
MATCH (j3:JobRole {id: 'role-fullstack'}), (nodejs:Skill {id: 'skill-nodejs'}) CREATE (j3)-[:REQUIRES_SKILL]->(nodejs);
MATCH (j3:JobRole {id: 'role-fullstack'}), (postgres:Skill {id: 'skill-postgres'}) CREATE (j3)-[:REQUIRES_SKILL]->(postgres);
MATCH (j4:JobRole {id: 'role-devops'}), (docker:Skill {id: 'skill-docker'}) CREATE (j4)-[:REQUIRES_SKILL]->(docker);
MATCH (j4:JobRole {id: 'role-devops'}), (k8s:Skill {id: 'skill-k8s'}) CREATE (j4)-[:REQUIRES_SKILL]->(k8s);
MATCH (j4:JobRole {id: 'role-devops'}), (aws:Skill {id: 'skill-aws'}) CREATE (j4)-[:REQUIRES_SKILL]->(aws);

// 6. Companies Hiring for Roles
MATCH (c1:Company {id: 'company-acme'}), (j1:JobRole {id: 'role-frontend'}) CREATE (c1)-[:HIRING_FOR]->(j1);
MATCH (c1:Company {id: 'company-acme'}), (j3:JobRole {id: 'role-fullstack'}) CREATE (c1)-[:HIRING_FOR]->(j3);
MATCH (c2:Company {id: 'company-globex'}), (j2:JobRole {id: 'role-backend'}) CREATE (c2)-[:HIRING_FOR]->(j2);
MATCH (c2:Company {id: 'company-globex'}), (j4:JobRole {id: 'role-devops'}) CREATE (c2)-[:HIRING_FOR]->(j4);
MATCH (c3:Company {id: 'company-soylent'}), (j3:JobRole {id: 'role-fullstack'}) CREATE (c3)-[:HIRING_FOR]->(j3);
MATCH (c4:Company {id: 'company-initech'}), (j1:JobRole {id: 'role-frontend'}) CREATE (c4)-[:HIRING_FOR]->(j1);

// 7. Create Developers and their relationships
CREATE (d1:Developer {id: 'dev-alice', name: 'Alice Smith', experience_years: 4, location: 'New York', bio: 'Frontend enthusiast'});
MATCH (d1:Developer {id: 'dev-alice'}), (react:Skill {id: 'skill-react'}) CREATE (d1)-[:HAS_SKILL {proficiency: 'Expert', years: 4}]->(react);
MATCH (d1:Developer {id: 'dev-alice'}), (ts:Skill {id: 'skill-ts'}) CREATE (d1)-[:HAS_SKILL {proficiency: 'Advanced', years: 3}]->(ts);
MATCH (d1:Developer {id: 'dev-alice'}), (tailwind:Skill {id: 'skill-tailwind'}) CREATE (d1)-[:HAS_SKILL {proficiency: 'Advanced', years: 3}]->(tailwind);
MATCH (d1:Developer {id: 'dev-alice'}), (c1:Company {id: 'company-acme'}) CREATE (d1)-[:WORKS_AT]->(c1);

CREATE (d2:Developer {id: 'dev-bob', name: 'Bob Jones', experience_years: 7, location: 'San Francisco', bio: 'Backend architecture is my passion'});
MATCH (d2:Developer {id: 'dev-bob'}), (nodejs:Skill {id: 'skill-nodejs'}) CREATE (d2)-[:HAS_SKILL {proficiency: 'Expert', years: 6}]->(nodejs);
MATCH (d2:Developer {id: 'dev-bob'}), (postgres:Skill {id: 'skill-postgres'}) CREATE (d2)-[:HAS_SKILL {proficiency: 'Expert', years: 5}]->(postgres);
MATCH (d2:Developer {id: 'dev-bob'}), (docker:Skill {id: 'skill-docker'}) CREATE (d2)-[:HAS_SKILL {proficiency: 'Advanced', years: 4}]->(docker);
MATCH (d2:Developer {id: 'dev-bob'}), (redis:Skill {id: 'skill-redis'}) CREATE (d2)-[:HAS_SKILL {proficiency: 'Intermediate', years: 2}]->(redis);
MATCH (d2:Developer {id: 'dev-bob'}), (c2:Company {id: 'company-globex'}) CREATE (d2)-[:WORKS_AT]->(c2);

CREATE (d3:Developer {id: 'dev-charlie', name: 'Charlie Brown', experience_years: 2, location: 'Remote', bio: 'Junior fullstack developer'});
MATCH (d3:Developer {id: 'dev-charlie'}), (js:Skill {id: 'skill-js'}) CREATE (d3)-[:HAS_SKILL {proficiency: 'Intermediate', years: 2}]->(js);
MATCH (d3:Developer {id: 'dev-charlie'}), (react:Skill {id: 'skill-react'}) CREATE (d3)-[:HAS_SKILL {proficiency: 'Intermediate', years: 1}]->(react);
MATCH (d3:Developer {id: 'dev-charlie'}), (nodejs:Skill {id: 'skill-nodejs'}) CREATE (d3)-[:HAS_SKILL {proficiency: 'Beginner', years: 1}]->(nodejs);
MATCH (d3:Developer {id: 'dev-charlie'}), (c3:Company {id: 'company-soylent'}) CREATE (d3)-[:WORKS_AT]->(c3);

CREATE (d4:Developer {id: 'dev-diana', name: 'Diana Prince', experience_years: 10, location: 'Austin', bio: 'Senior DevOps and Cloud Architect'});
MATCH (d4:Developer {id: 'dev-diana'}), (aws:Skill {id: 'skill-aws'}) CREATE (d4)-[:HAS_SKILL {proficiency: 'Expert', years: 8}]->(aws);
MATCH (d4:Developer {id: 'dev-diana'}), (docker:Skill {id: 'skill-docker'}) CREATE (d4)-[:HAS_SKILL {proficiency: 'Expert', years: 6}]->(docker);
MATCH (d4:Developer {id: 'dev-diana'}), (k8s:Skill {id: 'skill-k8s'}) CREATE (d4)-[:HAS_SKILL {proficiency: 'Expert', years: 4}]->(k8s);
MATCH (d4:Developer {id: 'dev-diana'}), (c4:Company {id: 'company-initech'}) CREATE (d4)-[:WORKS_AT]->(c4);

CREATE (d5:Developer {id: 'dev-eva', name: 'Eva Green', experience_years: 5, location: 'Remote', bio: 'Python & Data'});
MATCH (d5:Developer {id: 'dev-eva'}), (python:Skill {id: 'skill-python'}) CREATE (d5)-[:HAS_SKILL {proficiency: 'Expert', years: 5}]->(python);
MATCH (d5:Developer {id: 'dev-eva'}), (fastapi:Skill {id: 'skill-fastapi'}) CREATE (d5)-[:HAS_SKILL {proficiency: 'Advanced', years: 3}]->(fastapi);
MATCH (d5:Developer {id: 'dev-eva'}), (postgres:Skill {id: 'skill-postgres'}) CREATE (d5)-[:HAS_SKILL {proficiency: 'Advanced', years: 4}]->(postgres);

// 8. Create Projects
CREATE (p1:Project {id: 'proj-storefront', name: 'Storefront UI', description: 'Next generation e-commerce frontend', difficulty: 'Medium', year: 2023});
MATCH (p1:Project {id: 'proj-storefront'}), (react:Skill {id: 'skill-react'}) CREATE (p1)-[:USES_SKILL]->(react);
MATCH (p1:Project {id: 'proj-storefront'}), (ts:Skill {id: 'skill-ts'}) CREATE (p1)-[:USES_SKILL]->(ts);
MATCH (p1:Project {id: 'proj-storefront'}), (tailwind:Skill {id: 'skill-tailwind'}) CREATE (p1)-[:USES_SKILL]->(tailwind);
MATCH (p1:Project {id: 'proj-storefront'}), (c1:Company {id: 'company-acme'}) CREATE (p1)-[:BUILT_FOR]->(c1);
MATCH (d1:Developer {id: 'dev-alice'}), (p1:Project {id: 'proj-storefront'}) CREATE (d1)-[:WORKED_ON {role: 'Lead Frontend'}]->(p1);

CREATE (p2:Project {id: 'proj-payment', name: 'Payment API', description: 'High throughput payment processing', difficulty: 'Hard', year: 2022});
MATCH (p2:Project {id: 'proj-payment'}), (nodejs:Skill {id: 'skill-nodejs'}) CREATE (p2)-[:USES_SKILL]->(nodejs);
MATCH (p2:Project {id: 'proj-payment'}), (postgres:Skill {id: 'skill-postgres'}) CREATE (p2)-[:USES_SKILL]->(postgres);
MATCH (p2:Project {id: 'proj-payment'}), (redis:Skill {id: 'skill-redis'}) CREATE (p2)-[:USES_SKILL]->(redis);
MATCH (p2:Project {id: 'proj-payment'}), (c2:Company {id: 'company-globex'}) CREATE (p2)-[:BUILT_FOR]->(c2);
MATCH (d2:Developer {id: 'dev-bob'}), (p2:Project {id: 'proj-payment'}) CREATE (d2)-[:WORKED_ON {role: 'Backend Architect'}]->(p2);

CREATE (p3:Project {id: 'proj-infra', name: 'K8s Migration', description: 'Migrated legacy apps to Kubernetes', difficulty: 'Hard', year: 2021});
MATCH (p3:Project {id: 'proj-infra'}), (docker:Skill {id: 'skill-docker'}) CREATE (p3)-[:USES_SKILL]->(docker);
MATCH (p3:Project {id: 'proj-infra'}), (k8s:Skill {id: 'skill-k8s'}) CREATE (p3)-[:USES_SKILL]->(k8s);
MATCH (p3:Project {id: 'proj-infra'}), (aws:Skill {id: 'skill-aws'}) CREATE (p3)-[:USES_SKILL]->(aws);
MATCH (p3:Project {id: 'proj-infra'}), (c4:Company {id: 'company-initech'}) CREATE (p3)-[:BUILT_FOR]->(c4);
MATCH (d4:Developer {id: 'dev-diana'}), (p3:Project {id: 'proj-infra'}) CREATE (d4)-[:WORKED_ON {role: 'Lead DevOps'}]->(p3);

CREATE (p4:Project {id: 'proj-analytics', name: 'Data Pipeline', description: 'Real-time analytics processing', difficulty: 'Medium', year: 2023});
MATCH (p4:Project {id: 'proj-analytics'}), (python:Skill {id: 'skill-python'}) CREATE (p4)-[:USES_SKILL]->(python);
MATCH (p4:Project {id: 'proj-analytics'}), (fastapi:Skill {id: 'skill-fastapi'}) CREATE (p4)-[:USES_SKILL]->(fastapi);
MATCH (p4:Project {id: 'proj-analytics'}), (postgres:Skill {id: 'skill-postgres'}) CREATE (p4)-[:USES_SKILL]->(postgres);
MATCH (d5:Developer {id: 'dev-eva'}), (p4:Project {id: 'proj-analytics'}) CREATE (d5)-[:WORKED_ON {role: 'Data Engineer'}]->(p4);

CREATE (p5:Project {id: 'proj-mvp', name: 'Startup MVP', description: 'Quick proof of concept', difficulty: 'Easy', year: 2023});
MATCH (p5:Project {id: 'proj-mvp'}), (js:Skill {id: 'skill-js'}) CREATE (p5)-[:USES_SKILL]->(js);
MATCH (p5:Project {id: 'proj-mvp'}), (react:Skill {id: 'skill-react'}) CREATE (p5)-[:USES_SKILL]->(react);
MATCH (p5:Project {id: 'proj-mvp'}), (c3:Company {id: 'company-soylent'}) CREATE (p5)-[:BUILT_FOR]->(c3);
MATCH (d3:Developer {id: 'dev-charlie'}), (p5:Project {id: 'proj-mvp'}) CREATE (d3)-[:WORKED_ON {role: 'Developer'}]->(p5);


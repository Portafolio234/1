import React from 'react';

const Skills = () => {
    const skillCategories = [
        {
            title: "IA & LLMs",
            icon: "fa-robot",
            tags: ["Llama 3", "DeepSeek", "Roboflow", "LangChain", "HuggingFace", "OpenAI API"]
        },
        {
            title: "Desarrollo Web",
            icon: "fa-code",
            tags: ["HTML5 / CSS3", "JavaScript ES6+", "React.js", "Next.js", "Python (Flask/Django)", "Node.js"]
        },
        {
            title: "Full Stack Ecosystem",
            icon: "fa-layer-group",
            tags: ["System Architecture", "API Design (REST/GraphQL)", "Serverless & Microservices", "CI/CD Pipelines", "Agile Methodologies"]
        },
        {
            title: "Automatización & APIs",
            icon: "fa-network-wired",
            tags: ["n8n", "Postman", "Zapier", "Webhooks", "API Integrations"]
        },
        {
            title: "Herramientas & DevOps",
            icon: "fa-tools",
            tags: ["Git / GitHub", "Docker", "AWS", "Linux", "PostgreSQL"]
        }
    ];

    return (
        <section id="skills" className="py-24 px-[10%] relative z-10">
            <h2 className="text-4xl text-center mb-16 font-heading font-bold section-heading left-1/2 -translate-x-1/2">
                Habilidades Técnicas
            </h2>

            <div className="flex flex-wrap justify-center gap-6">
                {skillCategories.map((category, index) => (
                    <div
                        key={index}
                        className="glass-card flex-1 min-w-[300px] max-w-[450px] p-8 border-l-4 border-l-accent-primary"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <h3 className="text-xl mb-5 flex items-center gap-3 font-heading font-semibold text-white">
                            <i className={`fas ${category.icon} text-accent-secondary`}></i> {category.title}
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                            {category.tags.map((tag, idx) => (
                                <span key={idx} className="bg-white/5 px-4 py-2 rounded-[var(--radius-sm)] text-sm text-white/80 border border-white/10 hover:bg-accent-primary hover:text-bg-dark hover:border-accent-primary transition-all duration-300 cursor-default">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Skills;

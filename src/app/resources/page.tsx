export default function ResourcesPage() {
  const resources = [
    {
      title: 'Health Education Materials',
      description: 'Downloadable guides, posters, and educational materials on various health topics.',
      type: 'Educational',
    },
    {
      title: 'Research Publications',
      description: 'Access our latest research findings, case studies, and peer-reviewed publications.',
      type: 'Research',
    },
    {
      title: 'Program Reports',
      description: 'Annual reports and updates on our programs and their impact across Africa.',
      type: 'Reports',
    },
    {
      title: 'Policy Briefs',
      description: 'Evidence-based policy recommendations and advocacy materials.',
      type: 'Policy',
    },
    {
      title: 'Training Resources',
      description: 'Resources for healthcare workers and community health volunteers.',
      type: 'Training',
    },
    {
      title: 'News & Updates',
      description: 'Stay informed with our latest news, updates, and success stories.',
      type: 'News',
    },
  ]

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-primary-50 via-white to-surface-100 dark:from-primary-950/30 dark:via-neutral-950 dark:to-neutral-900">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="heading-1 mb-6">Resources</h1>
            <p className="text-body">
              Access our collection of educational materials, research publications,
              reports, and other resources designed to support public health
              initiatives across Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="section-padding bg-white dark:bg-neutral-950">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-gradient-to-br from-neutral-50 to-primary-50/30 dark:from-neutral-800/50 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              >
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary-600 dark:bg-primary-500 text-white">
                    {resource.type}
                  </span>
                </div>
                <h3 className="heading-3 mb-4">{resource.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">{resource.description}</p>
                <a
                  href="#"
                  className="inline-flex items-center text-primary-600 dark:text-primary-400 font-semibold group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors"
                >
                  Explore
                  <svg
                    className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}


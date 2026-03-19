/*
 * Copyright 2025 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export const htmlFixture = `<!doctype html>
<html lang="en" class="no-js">

<head>
  <meta name="description" content="Company&#x27;s Engineering Handbook">
</head>

<body dir="ltr" data-md-color-scheme="" data-md-color-primary="none" data-md-color-accent="none">
  <header class="md-header" data-md-component="header">
    <nav class="md-header__inner md-grid" aria-label="Header">
      <div class="md-header__title" data-md-component="header-title">
        <div class="md-header__ellipsis">
          <div class="md-header__topic">
            <span class="md-ellipsis">
              some-handbook
            </span>
          </div>
          <div class="md-header__topic" data-md-component="header-topic">
            <span class="md-ellipsis">
              Home
            </span>
          </div>
        </div>
      </div>
    </nav>
  </header>
  <div class="md-container" data-md-component="container">
    <main class="md-main" data-md-component="main">
      <div class="md-main__inner md-grid">
        <div class="md-sidebar md-sidebar--primary" data-md-component="sidebar" data-md-type="navigation">
          <div class="md-sidebar__scrollwrap">
            <div class="md-sidebar__inner">
              <nav class="md-nav md-nav--primary" aria-label="Navigation" data-md-level="0">
                <label class="md-nav__title" for="__drawer">
                  <a href="." title="some-handbook" class="md-nav__button md-logo" aria-label="some-handbook"
                    data-md-component="logo">
                    some-handbook
                  </a>
                </label>
                <ul class="md-nav__list" data-md-scrollfix>
                  <li class="md-nav__item md-nav__item--active">
                    <input class="md-nav__toggle md-toggle" data-md-toggle="toc" type="checkbox" id="__toc">
                    <label class="md-nav__link md-nav__link--active" for="__toc">
                      Home
                      <span class="md-nav__icon md-icon"></span>
                    </label>
                    <a href="." class="md-nav__link md-nav__link--active">
                      Home
                    </a>
                    <nav class="md-nav md-nav--secondary" aria-label="Table of contents">
                      <label class="md-nav__title" for="__toc">
                        <span class="md-nav__icon md-icon"></span>
                        Table of contents
                      </label>
                      <ul class="md-nav__list" data-md-component="toc" data-md-scrollfix>
                        <li class="md-nav__item">
                          <a href="#welcome-to-company-engineering" class="md-nav__link">
                            Welcome to Company Engineering
                          </a>
                        </li>
                        <li class="md-nav__item">
                          <a href="#career-growth" class="md-nav__link">
                            Career Growth
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </li>
                  <li class="md-nav__item md-nav__item--nested">
                    <input class="md-nav__toggle md-toggle" data-md-toggle="__nav_2" type="checkbox" id="__nav_2">
                    <label class="md-nav__link" for="__nav_2">
                      Welcome
                      <span class="md-nav__icon md-icon"></span>
                    </label>
                    <nav class="md-nav" aria-label="Welcome" data-md-level="1">
                      <label class="md-nav__title" for="__nav_2">
                        <span class="md-nav__icon md-icon"></span>
                        Welcome
                      </label>
                      <ul class="md-nav__list" data-md-scrollfix>
                        <li class="md-nav__item">
                          <a href="onboarding/" class="md-nav__link">
                            Welcome to Company Engineering
                          </a>
                        </li>
                        <li class="md-nav__item">
                          <a href="onboarding/engineering-values/" class="md-nav__link">
                            Values
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </li>
                  <li class="md-nav__item md-nav__item--nested">
                    <input class="md-nav__toggle md-toggle" data-md-toggle="__nav_3" type="checkbox" id="__nav_3">
                    <label class="md-nav__link" for="__nav_3">
                      Career Growth
                      <span class="md-nav__icon md-icon"></span>
                    </label>
                    <nav class="md-nav" aria-label="Career Growth" data-md-level="1">
                      <label class="md-nav__title" for="__nav_3">
                        <span class="md-nav__icon md-icon"></span>
                        Career Growth
                      </label>
                      <ul class="md-nav__list" data-md-scrollfix>
                        <li class="md-nav__item">
                          <a href="career-growth/" class="md-nav__link">
                            Index
                          </a>
                        </li>
                        <li class="md-nav__item md-nav__item--nested">
                          <input class="md-nav__toggle md-toggle" data-md-toggle="__nav_3_2" type="checkbox"
                            id="__nav_3_2">
                          <label class="md-nav__link" for="__nav_3_2">
                            Career Guide
                            <span class="md-nav__icon md-icon"></span>
                          </label>
                          <nav class="md-nav" aria-label="Career Guide" data-md-level="2">
                            <label class="md-nav__title" for="__nav_3_2">
                              <span class="md-nav__icon md-icon"></span>
                              Career Guide
                            </label>
                            <ul class="md-nav__list" data-md-scrollfix>
                              <li class="md-nav__item">
                                <a href="career-growth/career-guide/" class="md-nav__link">
                                  Index
                                </a>
                              </li>
                              <li class="md-nav__item">
                                <a href="career-growth/career-guide/software-engineer-job-levels/" class="md-nav__link">
                                  Software Engineer Job Levels
                                </a>
                              </li>
                            </ul>
                          </nav>
                        </li>
                      </ul>
                    </nav>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
        <div class="md-sidebar md-sidebar--secondary" data-md-component="sidebar" data-md-type="toc">
          <div class="md-sidebar__scrollwrap">
            <div class="md-sidebar__inner">
              <nav class="md-nav md-nav--secondary" aria-label="Table of contents">
                <label class="md-nav__title" for="__toc">
                  <span class="md-nav__icon md-icon"></span>
                  Table of contents
                </label>
                <ul class="md-nav__list" data-md-component="toc" data-md-scrollfix>
                  <li class="md-nav__item">
                    <a href="#welcome-to-company-engineering" class="md-nav__link">
                      Welcome to Company Engineering
                    </a>
                  </li>
                  <li class="md-nav__item">
                    <a href="#career-growth" class="md-nav__link">
                      Career Growth
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
        <div class="md-content" data-md-component="content">
          <article class="md-content__inner md-typeset">
            <h1 id="engineering-handbook">Engineering Handbook<a class="headerlink" href="#engineering-handbook"
                title="Permanent link">&para;</a></h1>
            <p>Welcome to Company's Engineering Handbook! This is currently a work in
              progress.</p>
            <p>To run the docs site locally, see the
              <a href="https://github.com/company/some-handbook">repo</a>.
            </p>
            <p>Below is the list of topics we would like to cover over time.</p>
            <h2 id="welcome-to-company-engineering"><a href="onboarding/">Welcome to Company Engineering</a><a
                class="headerlink" href="#welcome-to-company-engineering" title="Permanent link">&para;</a></h2>
            <ul>
              <li><a href="onboarding/engineering-values/">Engineering Values</a></li>
              <li><a href="onboarding/dei-commitments/">Engineering Diversity, Equity and Inclusion Commitments</a></li>
              <li><a href="onboarding/first-week/">What do I do on my first week?</a></li>
              <li><a href="onboarding/first-three-months/">What is expected of me in my first month? 3 months?</a></li>
              <li><a href="onboarding/eng-learn/">Onboarding &amp; Training</a></li>
              <li><a href="onboarding/role-expectations/">What is expected of me in my role?</a></li>
              <li><a href="onboarding/getting-help/">How to get help as an Engineer at WS</a></li>
              <li><a href="onboarding/quality-assurance/">Company’s Approach to Quality Assurance</a></li>
              <li><a href="onboarding/useful-developer-tools/">Useful Developer Tools</a></li>
            </ul>
            <h2 id="career-growth"><a href="career-growth/">Career Growth</a><a class="headerlink" href="#career-growth"
                title="Permanent link">&para;</a></h2>
            <ul>
              <li><a href="career-growth/career-guide/">Career Guide</a></li>
              <li><a href="career-growth/role-growth/">How does my role grow from here?</a></li>
              <li><a href="career-growth/broaden-skills/">How can I broaden my skill set outside my team?</a></li>
              <li><a href="career-growth/promotions-compensation/">How do promotions and compensation work?</a></li>
              <li><a href="career-growth/change-teams/">I'd like to change teams. What's the process?</a></li>
              <li><a href="career-growth/one-on-ones/">What is expected of me in my 1:1 with my manager?</a></li>
            </ul>
            <h2 id="operational-excellence"><a href="operational-excellence/">Operational Excellence</a><a
                class="headerlink" href="#operational-excellence" title="Permanent link">&para;</a></h2>
            <ul>
              <li><a href="operational-excellence/incident-response/">Incident Response</a></li>
              <li><a href="operational-excellence/operational-excellence/">What is operational excellence at
                  Company?</a></li>
              <li><a href="operational-excellence/on-call-expectations/">What is expected of me when I'm on call?</a>
              </li>
            </ul>
            <h2 id="engineering-guides"><a href="practices-processes/">Engineering Guides</a><a class="headerlink"
                href="#engineering-guides" title="Permanent link">&para;</a></h2>
            <ul>
              <li><a href="practices-processes/pull-request-reviews/">PR Reviews</a></li>
              <li><a href="practices-processes/architecture-decisions-records/">What are ADRs?</a></li>
              <li><a href="practices-processes/glossary/#technical-forum">What is Tech Forum?</a></li>
              <li><a href="practices-processes/working-group-how-to/">HOWTO: Start/Operate a Working Group </a></li>
              <li>Data flows at Company (TODO)</li>
            </ul>
            <h2 id="stack-guides"><a href="stack-guides/">Stack Guides</a><a class="headerlink" href="#stack-guides"
                title="Permanent link">&para;</a></h2>
            <p>Language and framework specific best practices and style guides.</p>
            <ul>
              <li><a href="stack-guides/ruby/readme/">Ruby</a></li>
              <li><a href="stack-guides/javascript/readme/">JavaScript</a></li>
              <li><a href="stack-guides/web-and-mobile/">Web and Mobile</a></li>
              <li><a href="stack-guides/graphql/readme/">GraphQL</a></li>
              <li><a href="stack-guides/kafka/readme/">Kafka</a></li>
            </ul>
            <h2 id="engineering-architecture"><a href="architecture/">Engineering Architecture</a><a class="headerlink"
                href="#engineering-architecture" title="Permanent link">&para;</a></h2>
            <ul>
              <li><a href="architecture/current/">What does our current architecture look like?</a></li>
              <li><a href="architecture/history/">History of the Company Architecture</a></li>
              <li><a href="architecture/services/">What teams own what services?</a></li>
            </ul>
            <h2 id="interviewing"><a href="interviewing/">Interviewing</a><a class="headerlink" href="#interviewing"
                title="Permanent link">&para;</a></h2>
            <ul>
              <li><a href="interviewing/best-practices/">Interviewing Best Practices</a></li>
              <li><a href="interviewing/process/">How does this process work?</a></li>
              <li><a href="interviewing/loops/">Interview loops and feedback</a></li>
            </ul>
            <h2 id="management"><a href="management/">Management</a><a class="headerlink" href="#management"
                title="Permanent link">&para;</a></h2>
            <ul>
              <li><a href="https://company.quip.com/Q0RVAvEDyDeB/Terms-Acronyms">Acronyms</a></li>
            </ul>
            <hr>
            <div class="md-source-file">
              <small>
                Last update:
                <span class="git-revision-date-localized-plugin git-revision-date-localized-plugin-date">April 6,
                  2022</span>
              </small>
            </div>
          </article>
        </div>
      </div>
    </main>
    <footer class="md-footer">
      <nav class="md-footer__inner md-grid" aria-label="Footer">
        <a href="onboarding/" class="md-footer__link md-footer__link--next"
          aria-label="Next: Welcome to Company Engineering" rel="next">
          <div class="md-footer__title">
            <div class="md-ellipsis">
              <span class="md-footer__direction">
                Next
              </span>
              Welcome to Company Engineering
            </div>
          </div>
        </a>
      </nav>
      <div class="md-footer-meta md-typeset">
        <div class="md-footer-meta__inner md-grid">
          <div class="md-copyright">
            Made with
            <a href="https://squidfunk.github.io/mkdocs-material/" target="_blank" rel="noopener">
              Material for MkDocs
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
  <div class="md-dialog" data-md-component="dialog">
    <div class="md-dialog__inner md-typeset"></div>
  </div>
</body>

</html>`;

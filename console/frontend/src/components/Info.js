import React from 'react'
import {Container, Header, HelpPanel, Icon, Link} from '@cloudscape-design/components'

const labelSuffix = 'Opens in a new tab';

function ExternalLinkItem({href, text}) {
    return (
        <Link href={href} ariaLabel={`${text} ${labelSuffix}`} target="_blank">
            {text}
        </Link>
    );
}

function SeparatedList({ariaLabel, items}) {
    return (
        <ul aria-label={ariaLabel}>
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    );
}

function ExternalLinkGroup({
                               header = 'Learn more',
                               groupAriaLabel,
                               items,
                               variant = 'default',
                           }) {
    const externalIcon = (
        <span role="img" aria-label="Icon external Link">
      <Icon name="external" size="inherit"/>
    </span>
    );

    if (variant === 'container') {
        return (
            <Container
                header={
                    <Header>
                        {header} {externalIcon}
                    </Header>
                }
            >
                <SeparatedList
                    ariaLabel={groupAriaLabel}
                    items={items.map((item, index) => (
                        <ExternalLinkItem key={index} href={item.href} text={item.text}/>
                    ))}
                />
            </Container>
        );
    }

    return (
        <>
            <h3>
                {header} {externalIcon}
            </h3>
            <ul aria-label={groupAriaLabel}>
                {items.map((item, index) => (
                    <li key={index}>
                        <ExternalLinkItem href={item.href} text={item.text}/>
                    </li>
                ))}
            </ul>
        </>
    );
}

export const MainInfo = () => {
    return (
        <HelpPanel
            header={<h2>Info</h2>}
            footer={
                <ExternalLinkGroup
                    items={[
                        {href: 'https://github.com/MatteoGioioso/postgres-explain', text: 'Contribute to this project'},
                        {href: 'https://www.postgresql.org/docs/current/sql-explain.html', text: 'Postgres SQL Explain'},
                        {href: 'https://www.postgresql.org/docs/current/using-explain.html', text: 'Using Explain'},
                    ]}
                />
            }
        >
            <p>
                This is a postgres query explain visualizer.
            </p>
            <p>If you find any issue please report it here: <a
                href="https://github.com/MatteoGioioso/postgres-explain/issues" target="_blank">github.com</a></p>
            <p>
                if you have any questions you can contact me:
            </p>
            <p><b>info@matteogioioso.com</b></p>
            <hr/>
            <p>For now this explainer only accepts plan formatted in JSON</p>
            <p><code>EXPLAIN (FORMAT JSON, ANALYZE, BUFFERS) SELECT * FROM mytable WHERE id='myid'</code></p>
        </HelpPanel>
    );
}
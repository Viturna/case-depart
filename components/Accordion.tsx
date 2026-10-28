'use client';

import React, { useState } from 'react';
import styles from './Accordion.module.css';

export interface AccordionItemData {
  id?: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItemData[];
  defaultOpenIndex?: number | null;
  className?: string;
}

export default function Accordion({
  items,
  defaultOpenIndex = null,
  className = '',
}: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`${styles.accordion} ${className}`}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const qIndex = `Q.${String(index + 1).padStart(2, '0')}`;

        return (
          <div
            key={item.id || index}
            className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}
          >
            <button
              type="button"
              className={styles.headerButton}
              onClick={() => toggleItem(index)}
              aria-expanded={isOpen}
            >
              <div className={styles.headerLeft}>
                <span className={styles.indexMono}>{qIndex}</span>
                <h4 className={styles.question}>{item.question}</h4>
              </div>
              <span className={styles.toggleSymbol} aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <div className={styles.content}>
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


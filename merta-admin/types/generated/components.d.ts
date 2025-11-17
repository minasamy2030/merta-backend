import type { Schema, Struct } from '@strapi/strapi';

export interface AboutAboutSection extends Struct.ComponentSchema {
  collectionName: 'components_about_about_sections';
  info: {
    displayName: 'About Section';
    icon: 'twitter';
  };
  attributes: {
    sectionContent: Schema.Attribute.Blocks;
    sectionTitle: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'about.about-section': AboutAboutSection;
    }
  }
}

export const SELLER_FIELDS = `
  id
  name
  avatarUrl
  phone
  verified
  sellerType
  isSuspended
  rating
  reviews
  positiveReviewPercent
  responseRate
  activeListings
  followerCount
  isFollowed
  memberSince
  countryCode
  location { countryCode state stateCode city district }
`;

export const LISTING_FIELDS = `
  id
  slug
  title
  description
  price
  category
  categoryName
  categorySchemaVersion
  condition
  location { countryCode state stateCode city district }
  images
  seller { ${SELLER_FIELDS} }
  createdAt
  expiresAt
  status
  views
  negotiable
  attributes
  featured
  urgent
  favorites
  inquiries
  sellerDeletedAt
`;

export const CATEGORY_FIELDS = `
  id
  name
  icon
  imageUrl
  active
  schemaVersion
  description
  pricing { mode label placeholder }
  condition { enabled required }
  fields {
    id label type required filterable allowCustomValue placeholder helpText unit min max step
    options { value label }
  }
  subcategories { id name icon imageUrl active }
`;

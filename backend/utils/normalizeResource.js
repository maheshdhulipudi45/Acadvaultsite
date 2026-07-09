const User = require('../models/User');

const LEGACY_TYPE_MAP = {
  pdf: 'pdf',
  ppt: 'ppt',
  docx: 'docx',
  zip: 'zip',
  youtube: 'youtube',
  drive: 'drive',
  website: 'website',
  github: 'github',
  link: 'website',
  assignments: 'pdf',
  notes: 'pdf',
  document: 'pdf',
};

const mapLegacyResourceType = (doc) => {
  if (doc.resourceType) return doc.resourceType;

  const candidates = [doc.resource_type, doc.file_type, doc.fileType]
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  for (const candidate of candidates) {
    if (LEGACY_TYPE_MAP[candidate]) {
      return LEGACY_TYPE_MAP[candidate];
    }
  }

  if (doc.file_url || doc.fileUrl) {
    const url = (doc.file_url || doc.fileUrl).toLowerCase();
    if (url.includes('youtu.be') || url.includes('youtube.com')) return 'youtube';
    if (url.includes('drive.google.com')) return 'drive';
    if (url.includes('github.com')) return 'github';
  }

  return 'pdf';
};

const isExternalResource = (resourceType) =>
  ['youtube', 'drive', 'website', 'github'].includes(resourceType);

const buildFileUrl = (doc, resourceType) => {
  const rawUrl = doc.fileUrl || doc.file_url || '';

  if (doc.file_data || rawUrl.includes('localhost')) {
    return `/api/resources/${doc._id}/file`;
  }

  if (isExternalResource(resourceType) && rawUrl) {
    return rawUrl;
  }

  return rawUrl;
};

const normalizeResource = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };

  delete obj.file_data;

  const resourceType = mapLegacyResourceType(obj);
  const fileUrl = buildFileUrl(obj, resourceType);
  const linkUrl = obj.linkUrl || (isExternalResource(resourceType) ? (obj.file_url || obj.fileUrl || '') : '');

  return {
    ...obj,
    resourceType,
    fileUrl,
    linkUrl,
    downloadsCount: obj.downloadsCount ?? obj.downloads ?? 0,
    isVerified: obj.isVerified ?? obj.verified ?? false,
    branch: obj.branch || obj.subject || obj.category || 'General',
    semester: obj.semester || 1,
    uploader: obj.uploader || null,
    legacyUserId: obj.user_id || null,
  };
};

const attachUploaders = async (resources) => {
  const missingUploaderIds = [
    ...new Set(
      resources
        .filter((resource) => !resource.uploader && resource.legacyUserId)
        .map((resource) => resource.legacyUserId.toString())
    ),
  ];

  if (missingUploaderIds.length === 0) {
    return resources.map(({ legacyUserId, ...resource }) => resource);
  }

  const users = await User.find({ _id: { $in: missingUploaderIds } }).select(
    'name avatarUrl points badge college branch'
  );
  const userMap = Object.fromEntries(users.map((user) => [user._id.toString(), user]));

  return resources.map(({ legacyUserId, ...resource }) => ({
    ...resource,
    uploader: resource.uploader || userMap[legacyUserId?.toString()] || null,
  }));
};

module.exports = {
  normalizeResource,
  attachUploaders,
};

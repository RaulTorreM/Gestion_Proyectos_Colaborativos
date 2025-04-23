// src/components/common/AvatarGroup.jsx
const Avatar = ({ user, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10'
    };
  
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-800 border border-white border-opacity-20 flex items-center justify-center overflow-hidden`}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-medium text-white">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        )}
      </div>
    );
  };
  
  const AvatarGroup = ({ users, limit = 3, size = 'md' }) => {
    const visibleUsers = users.slice(0, limit);
    const extraCount = users.length - limit;
  
    return (
      <div className="flex -space-x-2">
        {visibleUsers.map((user, index) => (
          <Avatar key={index} user={user} size={size} />
        ))}
        {extraCount > 0 && (
          <div className={`${size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gray-800 border border-white border-opacity-20 flex items-center justify-center text-xs font-medium text-white`}>
            +{extraCount}
          </div>
        )}
      </div>
    );
  };
  
  export default AvatarGroup;
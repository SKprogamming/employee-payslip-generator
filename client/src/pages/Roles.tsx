import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Code, TrendingUp, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import RoleModal from "@/components/RoleModal";
import type { Role } from "@shared/schema";

export default function Roles() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { toast } = useToast();

  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({ title: "Role deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    },
  });

  const handleCreateRole = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteRole = async (role: Role) => {
    if (confirm(`Are you sure you want to delete the role "${role.title}"?`)) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  const getRoleIcon = (department: string) => {
    switch (department.toLowerCase()) {
      case 'engineering':
        return Code;
      case 'marketing':
        return TrendingUp;
      case 'sales':
        return TrendingUp;
      default:
        return Palette;
    }
  };

  const getRoleColor = (department: string) => {
    switch (department.toLowerCase()) {
      case 'engineering':
        return 'bg-blue-100 text-primary';
      case 'marketing':
        return 'bg-purple-100 text-purple-600';
      case 'sales':
        return 'bg-green-100 text-success';
      default:
        return 'bg-yellow-100 text-warning';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Roles</h2>
          <p className="text-gray-600">Manage employee roles and permissions using composition pattern</p>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const IconComponent = getRoleIcon(role.department);
          const colorClass = getRoleColor(role.department);
          
          return (
            <Card key={role.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditRole(role)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteRole(role)}
                      className="text-red-600 hover:text-red-700"
                      disabled={deleteRoleMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Department</span>
                    <p className="text-sm font-medium text-gray-900 capitalize">{role.department}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Level</span>
                    <p className="text-sm font-medium text-gray-900">Level {role.level}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Salary Range</span>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(role.minSalary)} - {formatCurrency(role.maxSalary)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Responsibilities</h4>
                  <ul className="space-y-1">
                    {role.responsibilities.slice(0, 3).map((responsibility, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-success rounded-full mr-2"></div>
                        <span>{responsibility}</span>
                      </li>
                    ))}
                    {role.responsibilities.length > 3 && (
                      <li className="text-xs text-gray-500">
                        +{role.responsibilities.length - 3} more responsibilities
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No roles created yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first role</p>
          <Button onClick={handleCreateRole}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>
      )}

      {/* Role Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={editingRole}
      />
    </div>
  );
}

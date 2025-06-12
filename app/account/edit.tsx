import React from "react";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useColorMode } from "@/hooks/useColorMode";
import { useUser } from "@/hooks/useUser";
import { Input, InputField } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import authApi from "@/services/auth";
import { Alert } from "react-native";
import { useRouter } from "expo-router";


const schema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
});

type FormData = z.infer<typeof schema>;

export default function EditAccountScreen() {
    const { user, refreshUser } = useUser();
    const router = useRouter();
    const { colorMode } = useColorMode();

    const isDark = colorMode === "dark";
    const textColor = isDark ? "text-white" : "text-black";
    const inputBgColor = isDark ? "bg-gray-800" : "bg-white";

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const { mutate: updateUser, isPending } = useMutation({
        mutationFn: async (data: FormData) => {
            if (!user?.id) {
                throw new Error("User ID is required");
            }
            return authApi.updateUser(user.id, data);
        },
        onSuccess: () => {
            refreshUser(); // Refresh user data in context
            Alert.alert("Success", "Your profile has been updated");
            router.back();
        },
        onError: (error) => {
            console.error("Failed to update profile:", error);
            Alert.alert("Error", "Failed to update profile");
        },
    });

    // Fill initial data
    React.useEffect(() => {
        if (user) {
            setValue("firstName", user.firstName);
            setValue("lastName", user.lastName);
            setValue("dateOfBirth", (user as any).dateOfBirth ?? ""); 
        }
    }, [user]);

    const onSubmit = (data: FormData) => {
        updateUser(data);
    };

    return (
        <Box className="flex-1 p-4">
            <Box className="flex-row justify-between items-center mb-6">
                <Button
                    variant="link"
                    onPress={() => router.back()}
                    className={textColor}
                >
                    <ButtonText className={textColor}>← Back</ButtonText>
                </Button>
                <Text className={`text-2xl font-bold ${textColor}`}>Edit Profile</Text>
                <Box className="w-[50px]" /> {/* Empty box for alignment */}
            </Box>

            <Box className="space-y-4">
                <Box>
                    <Input className={inputBgColor}>
                        <InputField
                            placeholder="First Name"
                            {...register("firstName")}
                        />
                    </Input>
                    {errors.firstName ? (
                        <Text className="text-red-500 text-sm mt-1">{errors.firstName.message}</Text>
                    ) : null}
                </Box>

                <Box>
                    <Input className={inputBgColor}>
                        <InputField
                            placeholder="Last Name"
                            {...register("lastName")}
                        />
                    </Input>
                    {errors.lastName ? (
                        <Text className="text-red-500 text-sm mt-1">{errors.lastName.message}</Text>
                    ) : null}
                </Box>

                <Box>
                    <Input className={inputBgColor}>
                        <InputField
                            placeholder="Date of Birth (YYYY-MM-DD)"
                            {...register("dateOfBirth")}
                        />
                    </Input>
                    {errors.dateOfBirth ? (
                        <Text className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</Text>
                    ) : null}
                </Box>

                <Button
                    onPress={handleSubmit(onSubmit)}
                    isDisabled={isPending}
                    className="mt-4"
                >
                    <ButtonText className="text-white font-semibold">Save</ButtonText>
                </Button>
            </Box>
        </Box>
    );
}

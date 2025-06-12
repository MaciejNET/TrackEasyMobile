import React from "react";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useColorMode } from "@/hooks/useColorMode";
import { useUser } from "@/hooks/useUser";
import { Input, InputField } from "@gluestack-ui/themed";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Alert } from "react-native";
import { useRouter } from "expo-router";


const schema = z.object({
    firstName: z.string().min(1, "Imię jest wymagane"),
    lastName: z.string().min(1, "Nazwisko jest wymagane"),
    birthDate: z.string().min(1, "Data urodzenia jest wymagana"),
});

type FormData = z.infer<typeof schema>;

export default function EditAccountScreen() {
    const { user } = useUser();
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
            return axios.patch(
                `https://trackeasy-api-axaaadhhapfvg8cx.polandcentral-01.azurewebsites.net/users/${user?.id}/update`,
                { id: user?.id, ...data }
            );
        },
        onSuccess: () => {
            Alert.alert("Sukces", "Dane zostały zaktualizowane");
            router.back();
        },
        onError: () => {
            Alert.alert("Błąd", "Nie udało się zaktualizować danych");
        },
    });

    // Wypełnij dane początkowe
    React.useEffect(() => {
        if (user) {
            setValue("firstName", user.firstName);
            setValue("lastName", user.lastName);
            setValue("birthDate", (user as any).birthDate ?? ""); 
        }
    }, [user]);

    const onSubmit = (data: FormData) => {
        updateUser(data);
    };

    return (
        <Box className="flex-1 p-4">
            <Text className={`text-2xl font-bold mb-6 ${textColor}`}>Edytuj dane</Text>

            <Box className="space-y-4">
                <Box>
                    <Input className={inputBgColor}>
                        <InputField
                            placeholder="Imię"
                            {...register("firstName")}
                        />
                    </Input>
                    {errors.firstName && (
                        <Text className="text-red-500 text-sm mt-1">{errors.firstName.message}</Text>
                    )}
                </Box>

                <Box>
                    <Input className={inputBgColor}>
                        <InputField
                            placeholder="Nazwisko"
                            {...register("lastName")}
                        />
                    </Input>
                    {errors.lastName && (
                        <Text className="text-red-500 text-sm mt-1">{errors.lastName.message}</Text>
                    )}
                </Box>

                <Box>
                    <Input className={inputBgColor}>
                        <InputField
                            placeholder="Data urodzenia (YYYY-MM-DD)"
                            {...register("birthDate")}
                        />
                    </Input>
                    {errors.birthDate && (
                        <Text className="text-red-500 text-sm mt-1">{errors.birthDate.message}</Text>
                    )}
                </Box>

                <Button
                    onPress={handleSubmit(onSubmit)}
                    isDisabled={isPending}
                    className="mt-4"
                >
                    <Text className="text-white font-semibold">Zapisz</Text>
                </Button>
            </Box>
        </Box>
    );
}

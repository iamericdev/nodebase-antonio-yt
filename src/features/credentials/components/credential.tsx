"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CredentialType } from "@/generated/prisma/enums";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  useCreateCredential,
  useSuspenseCredential,
  useUpdateCredential,
} from "../hooks/use-credentials";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(CredentialType),
  value: z.string().min(1, "API Key is required"),
});

type FormSchemaType = z.infer<typeof formSchema>;

const createCredentialTypeOptions = [
  {
    value: CredentialType.GEMINI,
    label: "Gemini",
    logo: "/images/gemini.svg",
  },
  {
    value: CredentialType.OPENAI,
    label: "OpenAI",
    logo: "/images/openai.svg",
  },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/images/anthropic.svg",
  },
];

interface CredentialFormProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value: string;
  };
}

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpgradeModal();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || CredentialType.GEMINI,
      value: initialData?.value || "",
    },
  });

  const isEdit = !!initialData?.id;

  const onSubmit = async (data: FormSchemaType) => {
    if (isEdit && initialData?.id) {
      await updateCredential.mutateAsync(
        {
          id: initialData.id,
          name: data.name,
          type: data.type,
          value: data.value,
        },
        {
          onSuccess: () => {
            toast.success("Credential updated successfully");
            router.refresh();
          },
          onError: (error) => {
            toast.error(`Failed to update credential: ${error.message}`);
            handleError(error);
          },
        },
      );
    } else {
      await createCredential.mutateAsync(
        {
          name: data.name,
          type: data.type,
          value: data.value,
        },
        {
          onSuccess: (data) => {
            toast.success("Credential created successfully");
            router.push(`/credentials/${data.id}`);
          },
          onError: (error) => {
            toast.error(`Failed to create credential: ${error.message}`);
            handleError(error);
          },
        },
      );
    }
  };

  return (
    <>
      {modal}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit" : "Create"} Credential</CardTitle>
          <CardDescription>
            {isEdit ? "Update" : "Add"} your API key to{" "}
            {isEdit ? "update" : "create"} a new credential.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My API Key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {createCredentialTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Image
                                src={option.logo}
                                alt={option.label}
                                width={16}
                                height={16}
                              />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="My API Key"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="submit"
                  disabled={
                    isEdit
                      ? updateCredential.isPending
                      : createCredential.isPending
                  }
                >
                  {isEdit
                    ? updateCredential.isPending
                      ? "Updating..."
                      : "Update"
                    : createCredential.isPending
                      ? "Creating..."
                      : "Create"}
                </Button>

                <Button type="button" variant="outline" asChild>
                  <Link href="/credentials" prefetch>
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

interface CredentialViewProps {
  credentialId: string;
}

export const CredentialView = ({ credentialId }: CredentialViewProps) => {
  const { data: credential } = useSuspenseCredential(credentialId);

  return <CredentialForm initialData={credential} />;
};

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import LicenseRequired from "@calcom/features/ee/common/components/LicenseRequired";
import { getLayout } from "@calcom/features/settings/layouts/SettingsLayout";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import {
  Meta,
  Switch,
  Dropdown,
  Button,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownItem,
  DropdownMenuItem,
  Icon,
  Dialog,
  DialogContent,
  InputField,
  DialogFooter,
  DialogClose,
  SelectField,
  Form,
  showToast,
} from "@calcom/ui";

type AttributeItemProps = RouterOutputs["viewer"]["attributes"]["get"][number];

function AttributeItem({ attribute }: { attribute: AttributeItemProps }) {
  const { t } = useLocale();
  return (
    <ul className="focus-within:border-emphasis flex justify-between p-4" key={attribute.id}>
      <div>
        <h3 className="leadning-none text-sm font-semibold">{attribute.name}</h3>
        <p className="text-default leadning-none text-sm font-normal">{attribute.type}</p>
      </div>
      <div className="flex gap-4">
        <Switch checked={attribute.enabled} />
        <Dropdown modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="icon"
              color="secondary"
              StartIcon="ellipsis"
              className="ltr:radix-state-open:rounded-r-md rtl:radix-state-open:rounded-l-md"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <DropdownItem type="button" StartIcon="pencil">
                {t("edit")}
              </DropdownItem>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DropdownItem type="button" StartIcon="trash-2" color="destructive">
                {t("delete")}
              </DropdownItem>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </Dropdown>
      </div>
    </ul>
  );
}

const AttributeTypeOptions = [
  { value: "TEXT", label: "Text" },
  { value: "NUMBER", label: "Number" },
  { value: "SINGLE_SELECT", label: "Single Select" },
  { value: "MULTI_SELECT", label: "Multi Select" },
];

export const createAttributeSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["TEXT", "NUMBER", "SINGLE_SELECT", "MULTI_SELECT"]),
});

function AddAttributesModal(props: { onClose: (state: boolean) => void }) {
  const { t } = useLocale();
  const form = useForm<typeof createAttributeSchema>({
    resolver: zodResolver(createAttributeSchema),
  });
  const router = useRouter();
  const mutation = trpc.viewer.attributes.create.useMutation({
    onSuccess: () => {
      showToast(t("attribute_created_successfully"), "success");
    },
  });

  return (
    <Dialog open={true} onOpenChange={(state) => props.onClose(state)}>
      <DialogContent>
        <Form
          form={form}
          className="flex flex-col gap-4"
          handleSubmit={(values) => {
            mutation.mutate(values);
          }}>
          <h2 className="text-emphasis leadning-none text-base font-semibold">Add Attribute</h2>
          <InputField label="Attribute Name" {...form.register("name")} />
          <Controller
            control={form.control}
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Type"
                onChange={(option) => {
                  if (!option) return;
                  onChange(option.value);
                }}
                value={AttributeTypeOptions.find((opt) => opt.value === value)}
                required
                options={AttributeTypeOptions}
              />
            )}
          />
        </Form>
        <DialogFooter className="mt-6">
          <DialogClose />
          <Button type="submit" isLoading={mutation.isPending}>
            {t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrganizationAttributesPage() {
  const { t } = useLocale();
  const [openAddAttributes, setOpenAddAttributes] = useState(false);
  const { data, isLoading } = trpc.viewer.attributes.list.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Meta title="Attributes" description="Manage attributes for your team members" />

      <LicenseRequired>
        <div className="border-subtle bg-default flex flex-col gap-4 rounded-lg border p-6">
          {data && data?.length > 0 ? (
            <>
              <h2 className="text-emphasis leadning-none text-base font-semibold">{t("custom")}</h2>
              <li className="border-subtle bg-default divide-subtle flex flex-col divide-y rounded-lg border">
                {data?.map((attribute) => (
                  <AttributeItem attribute={attribute} key={attribute.id} />
                ))}
              </li>
              <Button
                className="w-fit"
                StartIcon="plus"
                color="minimal"
                onClick={() => setOpenAddAttributes(true)}>
                {t("add")}
              </Button>
            </>
          ) : (
            <div className="flex w-full flex-col items-center justify-center p-14">
              <div className="bg-emphasis text-emphasis flex h-16 w-16 items-center justify-center rounded-full p-2">
                <Icon name="loader" />
              </div>
              <h2 className="font-cal text-emphasis mt-6 text-xl font-semibold leading-none">
                {t("add_attributes")}
              </h2>

              <p className="text-emphasis mt-3 text-sm font-normal leading-none">
                {t("add_attributes_description")}
              </p>
              <Button
                className="mt-8"
                StartIcon="plus"
                color="secondary"
                onClick={() => setOpenAddAttributes(true)}>
                {t("new_attribute")}
              </Button>
            </div>
          )}
        </div>
      </LicenseRequired>
      {openAddAttributes && <AddAttributesModal onClose={setOpenAddAttributes} />}
    </>
  );
}

OrganizationAttributesPage.getLayout = getLayout;

export default OrganizationAttributesPage;

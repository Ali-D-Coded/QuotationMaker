<script setup lang="ts">
// import { ref, reactive, onMounted, watch } from "vue";
// import { generatePseudoUUID, generateCustomerID } from "@/utils"; // Assuming these utilities are available

const rows = ref([
  {
    id: generatePseudoUUID(),
    itemid: "",
    qtty: 1,
    price: null,
    amt: null,
  },
]);

const addRow = () => {
  rows.value.push({
    id: generatePseudoUUID(),
    itemid: "",
    qtty: 1,
    price: null,
    amt: null,
  });
};

const removeRow = (id: string) => {
  if (rows.value.length > 1) {
    rows.value = rows.value.filter((it: any) => it.id !== id);
  }
};

const items = ref<{ id: string; name: string; amount: number }[]>([]);

const fetchItems = async () => {
  try {
    const response: any = await $fetch("/api/qoutation-items");
    if (!response) {
      throw new Error("Network response was not ok");
    }

    items.value = response.map((it: any) => ({
      id: it.id,
      name: it.Item,
      amount: it.Price,
    }));
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

onMounted(() => {
  fetchItems();
});

const updateItemAmount = (id: string, qtty: number = 0, disc: number = 0) => {
  const row = rows.value.find((it: any) => it.itemid === id);
  const item = items.value.find((it: any) => it.id === id);
  if (row && item) {
    let amt = qtty > 0 ? qtty * item.amount : 0;
    if (disc > 0) {
      amt -= (amt * disc) / 100;
    }
    row.amt = amt;
    row.price = item.amount;
  }
};

const includeGST = ref<Boolean>(false);

const toggleGST = (event: Event) => (includeGST.value = event?.target?.checked);

const calculateSubtotal = () =>
  rows.value.reduce((total: number, row: any) => total + (row.amt || 0), 0);

const calculateBalance = () => {
  const sub = calculateSubtotal();
  const gst = includeGST.value ? (sub * 18) / 100 : 0;
  return sub + gst;
};

const calculateGST = () =>
  includeGST ? ((calculateSubtotal() * 18) / 100).toFixed(2) : 0;

const formData = reactive({
  date: undefined,
  customerId: "",
  validtill: undefined,
  projectDescription: "",
  customer: {
    companyName: "",
    name: "",
    address: "",
    email: "",
    phone: "",
  },
  items: [],
});

watch(
  rows,
  () => {
    rows.value.forEach((row: any) => {
      const item = items.value.find((it: any) => it.id === row.itemid);
      if (item) {
        updateItemAmount(row.itemid, row.qtty, row.disc);
      }
    });

    formData.items = rows.value.map((row: any) => ({
      id: row.itemid,
      name: items.value.find((item: any) => item.id === row.itemid)?.name || "",
      qtt: row.qtty || 0,
      amount: row.amt || 0,
      price: row.price || 0,
    })) as any;
  },
  { deep: true }
);

const printPdf = async () => {
  const dataform = {
    date: formData.date,
    customerId: formData.customerId,
    validTill: formData.validtill,
    customer: formData.customer.companyName,
    projectDescription: formData.projectDescription,
    tableData: formData.items.map((it: any) => [
      it.name,
      String(it.qtt),
      String(it.price),
      String(it.amount),
    ]),
    subtotal: calculateSubtotal().toFixed(2),
    gst: includeGST.value ? calculateGST() : "0",
    total: calculateBalance().toFixed(2),
  };

  const response: any = await $fetch("/api/pdf/generate-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: dataform,
  });

  const url = URL.createObjectURL(response);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotation.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="h-screen w-screen grid place-items-center p-6 overflow-auto">
    <main
      class="p-3 border border-gray-300 h-fit w-[100%] min-w-[600px] max-w-[600px] relative"
    >
      <!-- Header section start-->
      <nav class="flex justify-between items-center mb-16">
        <div>
          <img src="/ashlogo336x52.svg" alt="ASHCORP Logo" width="200" />
        </div>
        <div class="text-3xl font-bold text-[#72184F]">Quotation</div>
      </nav>
      <!-- Header section end -->

      <!-- Address section start-->
      <section class="flex justify-between items-center text-sm mb-8">
        <div>
          <table>
            <tr>
              <th class="text-left">ASHCORP Technologies</th>
            </tr>
            <tr>
              <td>2nd floor, OPS Mall, Vailathur,Tirur</td>
            </tr>
            <tr>
              <td>connect@ashcorptechnologies.com</td>
            </tr>
            <tr>
              <td>+91 8921365750</td>
            </tr>
          </table>
        </div>

        <div class="w-[250px]">
          <table class="w-full">
            <tr>
              <td class="w-[110px]">Date:</td>
              <td class="border border-gray-400">
                <input
                  type="date"
                  class="border w-[100%] outline-none"
                  v-model="formData.date"
                />
              </td>
            </tr>
            <tr>
              <td class="w-[110px]">Customer ID:</td>
              <td class="border border-gray-400">
                <input
                  type="text"
                  class="border w-[100%] outline-none"
                  v-model="formData.customerId"
                />
                <button
                  class="bg-orange-500 w-full"
                  @click="() => (formData.customerId = generateCustomerID())"
                >
                  generate
                </button>
              </td>
            </tr>
            <tr>
              <td class="w-[110px]">Valid till:</td>
              <td class="border border-gray-400">
                <input
                  type="date"
                  class="border w-[100%] outline-none"
                  v-model="formData.validtill"
                />
              </td>
            </tr>
          </table>
        </div>
      </section>
      <!-- Address section end-->

      <!-- Customer Section start-->
      <section class="text-sm mb-10">
        <div class="w-[250px]">
          <table class="w-full">
            <tr class="mb-1">
              <th
                class="text-left text-white px-2 bg-[#83246D] font-normal"
                colspan="2"
              >
                Customer :
              </th>
            </tr>
            <tr>
              <td class="w-[110px]">Company Name:</td>
              <td>
                <input
                  type="text"
                  class="border w-[100%] outline-none"
                  v-model="formData.customer.companyName"
                />
              </td>
            </tr>
            <tr>
              <td class="w-[110px]">Name:</td>
              <td>
                <input
                  type="text"
                  class="border w-[100%] outline-none"
                  v-model="formData.customer.name"
                />
              </td>
            </tr>
            <tr>
              <td class="w-[110px]">Address:</td>
              <td>
                <input
                  type="text"
                  class="border w-[100%] outline-none"
                  v-model="formData.customer.address"
                />
              </td>
            </tr>
            <tr>
              <td class="w-[110px]">Email:</td>
              <td>
                <input
                  type="email"
                  class="border w-[100%] outline-none"
                  v-model="formData.customer.email"
                />
              </td>
            </tr>
            <tr>
              <td class="w-[110px]">Phone:</td>
              <td>
                <input
                  type="tel"
                  class="border w-[100%] outline-none"
                  v-model="formData.customer.phone"
                />
              </td>
            </tr>
          </table>
        </div>
      </section>
      <!-- Customer Section end-->

      <!-- Project description -->
      <div>
        <span class="text-left text-white px-2 bg-[#83246D] font-normal"
          >Project Description</span
        >
        <textarea
          class="w-full h-full border border-gray-400 outline-0"
          placeholder="Enter project description"
          required
          v-model="formData.projectDescription"
        ></textarea>
      </div>
      <!-- Project description end  -->

      <!-- Items Section start-->
      <section class="mb-10 text-sm">
        <div>
          <table class="w-full itemtable">
            <thead class="text-white">
              <tr>
                <th class="border itemth bg-[#83246D] font-normal">Item#</th>
                <th class="border itemth bg-[#83246D] font-normal w-[130px]">
                  Quantity
                </th>
                <th class="border itemth bg-[#83246D] font-normal w-[130px]">
                  Price
                </th>
                <th class="border itemth bg-[#83246D] font-normal w-[180px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in rows"
                :key="row.id"
                class="bg-gray-200 relative"
                @dblclick="() => removeRow(row.id)"
              >
                <td class="itemtd">
                  <select v-model="row.itemid" class="outline-none w-full">
                    <option value="">Select item</option>
                    <option
                      v-for="item in items"
                      :key="item.id"
                      :value="item.id"
                      class=""
                    >
                      {{ item.name }}
                    </option>
                  </select>
                </td>
                <td class="itemtd">
                  <input
                    v-model="row.qtty"
                    @change="() => updateItemAmount(row.itemid, row.qtty)"
                    type="number"
                    class="border w-[100%] outline-none bg-transparent"
                  />
                </td>
                <td class="itemtd">
                  <input
                    v-model="row.price"
                    type="number"
                    class="border w-[100%] outline-none bg-transparent"
                  />
                </td>
                <td class="itemtd">{{ row.amt }}</td>
              </tr>
              <tr>
                <td colspan="4">
                  <button class="border p-2 bg-blue-300 w-full" @click="addRow">
                    add new row
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex justify-end">
          <table class="w-[310px] itemtable">
            <tr>
              <td class="itemtd w-[129px] font-bold">Sub Total:</td>
              <td class="itemtd border border-gray-400">
                {{ calculateSubtotal() }}
              </td>
            </tr>
            <tr>
              <td class="itemtd w-[129px] font-bold">GST:</td>
              <td class="itemtd border border-gray-400">
                {{ calculateGST() }}
              </td>
              <td class="itemtd border border-gray-400">
                <input type="checkbox" @change="toggleGST($event)" />
              </td>
            </tr>
            <tr>
              <td class="itemtd w-[129px] font-bold">Balance:</td>
              <td class="itemtd border border-gray-400">
                {{ calculateBalance() }}
              </td>
            </tr>
          </table>
        </div>
      </section>
      <!-- Items Section end-->

      <section
        class="bg-gray-300 h-10 flex justify-center items-center text-white text-xl"
      >
        Thank You For Your Business!
      </section>
      <button
        class="border-2 p-2 absolute -top-1 -right-[60px] font-bold"
        @click="printPdf"
      >
        Print
      </button>
    </main>
  </div>
</template>

<style scoped>
.itemtable,
.itemtd,
.itemth {
  border-collapse: collapse;
  border: 1px solid rgb(164, 164, 164);
}
</style>
